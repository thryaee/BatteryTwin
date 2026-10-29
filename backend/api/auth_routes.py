"""
api/auth_routes.py
------------------
Authentication endpoints for BatteryTwin.

Endpoints
---------
POST /api/auth/register          – public user registration (role always = user)
POST /api/auth/login             – user login → access + refresh tokens
POST /api/auth/admin/login       – admin login → access + refresh tokens
POST /api/auth/refresh           – exchange refresh token for new access token
POST /api/auth/logout            – client-side token discard (stateless JWT)
GET  /api/auth/me                – return current user's safe profile
POST /api/auth/forgot-password   – request a password-reset link (stub)
POST /api/auth/reset-password    – complete password reset with token (stub)

Security notes:
  - Roles are ALWAYS read from the database, never from request bodies.
  - The admin/login endpoint verifies role == admin on the backend.
  - Generic "Invalid credentials" messages prevent user enumeration.
  - Rate limiting is applied via slowapi (configured in main.py).
  - Refresh tokens are sent/read via httpOnly cookies for XSS resistance;
    the access token is returned in the JSON body for SPA use.
"""

from datetime import datetime, timedelta, timezone
import hashlib
import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from auth.dependencies import require_authenticated
from auth.schemas import (
    AdminLoginRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MessageResponse,
    RefreshRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserProfile,
)
from auth.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    validate_password_strength,
    verify_password,
)
from config import settings
from database.connection import get_db
from database.crud import (
    clear_reset_token,
    create_user,
    email_exists,
    get_user_by_email,
    get_user_by_id,
    set_reset_token,
    update_last_login,
    update_password,
)
from database.models import User, UserRole
from utils.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Rate limiter instance (shares state with the one registered in main.py)
limiter = Limiter(key_func=get_remote_address)

# Cookie name for the refresh token
_REFRESH_COOKIE = "bt_refresh_token"

# ── Helpers ────────────────────────────────────────────────────────

_INVALID_CREDENTIALS = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid email or password.",
)


def _set_refresh_cookie(response: Response, token: str, remember: bool) -> None:
    """Write the refresh token into a secure, httpOnly cookie."""
    max_age = (
        settings.refresh_token_expire_days * 86_400
        if remember
        else None  # session cookie
    )
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=(settings.app_env == "production"),
        samesite="lax",
        max_age=max_age,
        path="/api/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE, path="/api/auth")


def _authenticate(db: Session, email: str, password: str) -> User:
    """
    Shared login logic. Returns User on success.
    Always raises _INVALID_CREDENTIALS on any failure so callers cannot
    distinguish between 'email not found' and 'wrong password'.
    """
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise _INVALID_CREDENTIALS
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )
    return user


# ── Register ───────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=UserProfile,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
)
@limiter.limit(settings.auth_rate_limit)
def register(request: Request, body: RegisterRequest, db: Session = Depends(get_db)):
    """
    Public endpoint. Role is always set to `user` on the server.
    Any attempt to supply a role in the request body is silently ignored
    because the schema does not accept a role field.
    """
    # Password strength
    violations = validate_password_strength(body.password)
    if violations:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=violations,
        )

    # Duplicate email check
    if email_exists(db, body.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    user = create_user(
        db=db,
        full_name=body.full_name,
        email=body.email,
        hashed_password=hash_password(body.password),
        role=UserRole.user,   # always user – never from request
        is_active=True,
        is_verified=False,
    )
    db.commit()
    db.refresh(user)
    logger.info(f"New user registered: {user.email} (id={user.id})")
    return UserProfile.model_validate(user)


# ── User login ─────────────────────────────────────────────────────

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate a user and issue tokens",
)
@limiter.limit(settings.auth_rate_limit)
def login(
    request: Request,
    body: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = _authenticate(db, body.email, body.password)

    # Verify this is a normal user account
    if user.role != UserRole.user:
        # Admin trying to use the user login – deny for clarity
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrator accounts must use the admin login endpoint.",
        )

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    _set_refresh_cookie(response, refresh_token, body.remember_me)
    update_last_login(db, user)
    db.commit()

    logger.info(f"User logged in: {user.email} (id={user.id})")
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── Admin login ────────────────────────────────────────────────────

@router.post(
    "/admin/login",
    response_model=TokenResponse,
    summary="Authenticate an administrator",
)
@limiter.limit(settings.auth_rate_limit)
def admin_login(
    request: Request,
    body: AdminLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    user = _authenticate(db, body.email, body.password)

    # Enforce admin role on the backend – never trust the frontend
    if user.role != UserRole.admin:
        logger.warning(
            f"Non-admin login attempt on admin endpoint: {body.email}"
        )
        raise _INVALID_CREDENTIALS

    access_token = create_access_token(user.id, user.role.value)
    refresh_token = create_refresh_token(user.id)

    # Admin sessions: always session cookies (no remember_me)
    _set_refresh_cookie(response, refresh_token, remember=False)
    update_last_login(db, user)
    db.commit()

    logger.info(f"Admin logged in: {user.email} (id={user.id})")
    return TokenResponse(
        access_token=access_token,
        role=user.role,
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── Token refresh ──────────────────────────────────────────────────

@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Exchange a refresh token for a new access token",
)
def refresh_tokens(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Reads the refresh token from the httpOnly cookie.
    Falls back to a JSON body field `refresh_token` for clients that
    cannot use cookies (e.g. mobile apps, Postman testing).
    """
    token = request.cookies.get(_REFRESH_COOKIE)

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided.",
        )

    payload = decode_refresh_token(token)
    if payload is None:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Malformed token.")

    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        _clear_refresh_cookie(response)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")

    new_access = create_access_token(user.id, user.role.value)
    new_refresh = create_refresh_token(user.id)
    _set_refresh_cookie(response, new_refresh, remember=True)

    return TokenResponse(
        access_token=new_access,
        role=user.role,
        expires_in=settings.access_token_expire_minutes * 60,
    )


# ── Logout ─────────────────────────────────────────────────────────

@router.post(
    "/logout",
    response_model=MessageResponse,
    summary="End the current session",
)
def logout(response: Response):
    """
    Clears the refresh token cookie. The client is responsible for
    discarding the access token from memory. Because JWTs are stateless,
    the access token remains technically valid until its exp claim; the
    short expiry (30 min default) limits the exposure window.
    """
    _clear_refresh_cookie(response)
    return MessageResponse(message="Logged out successfully.")


# ── Current user profile ───────────────────────────────────────────

@router.get(
    "/me",
    response_model=UserProfile,
    summary="Return the current authenticated user's profile",
)
def get_me(current_user: User = Depends(require_authenticated)):
    """Returns safe profile data. Never returns the password hash."""
    return UserProfile.model_validate(current_user)


# ── Forgot / reset password ────────────────────────────────────────

@router.post(
    "/forgot-password",
    response_model=MessageResponse,
    summary="Request a password reset link",
)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """
    Always returns a success-like message regardless of whether the email
    exists to prevent user enumeration.

    Email delivery: set SMTP_* environment variables to enable actual
    email dispatch. Until then the reset token is logged at INFO level
    (development only) so it can be used without email infrastructure.
    """
    user = get_user_by_email(db, body.email)

    if user and user.is_active:
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        expires_at = datetime.now(tz=timezone.utc) + timedelta(hours=1)

        set_reset_token(db, user, token_hash, expires_at)
        db.commit()

        # ── Email delivery placeholder ─────────────────────────────
        # TODO: integrate an SMTP client (e.g. FastMail, SendGrid) here.
        # The reset link would be:
        #   {FRONTEND_URL}/reset-password?token={raw_token}
        if settings.app_env == "development":
            logger.info(
                f"[DEV] Password reset token for {user.email}: {raw_token}\n"
                f"  Expires at: {expires_at.isoformat()}"
            )

    return MessageResponse(
        message=(
            "If an account with that email exists, a password reset link "
            "has been sent. Please check your inbox."
        )
    )


@router.post(
    "/reset-password",
    response_model=MessageResponse,
    summary="Complete password reset with a valid token",
)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    """
    Validates the reset token and sets a new password.
    The token is hashed before comparison so the raw value is never stored.
    """
    violations = validate_password_strength(body.new_password)
    if violations:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=violations,
        )

    token_hash = hashlib.sha256(body.token.encode()).hexdigest()

    # Find user by token hash (linear scan is acceptable for a low-volume endpoint)
    from sqlalchemy import and_
    from database.models import User as UserModel
    from database.connection import get_db as _get_db

    user = (
        db.query(UserModel)
        .filter(
            and_(
                UserModel.reset_token_hash == token_hash,
                UserModel.reset_token_expires_at > datetime.now(tz=timezone.utc),
            )
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired password reset token.",
        )

    update_password(db, user, hash_password(body.new_password))
    clear_reset_token(db, user)
    db.commit()

    logger.info(f"Password reset completed for user id={user.id}")
    return MessageResponse(message="Your password has been reset successfully. Please log in.")
