"""
auth/security.py
----------------
Password hashing (bcrypt via passlib) and JWT creation/verification.

Design decisions:
  - passlib CryptContext wraps bcrypt; auto-upgrades hashes on login.
  - Access tokens (short-lived, 30 min default) carry role + sub claims.
  - Refresh tokens (longer-lived, 7 days default) only carry sub + type.
  - Token type is validated on decode to prevent token confusion attacks.
  - Never call create_*_token outside this module without careful thought.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)

# ── Password hashing ───────────────────────────────────────────────

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    """Return a bcrypt hash of the given plaintext password."""
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """
    Return True if plain matches hashed.
    passlib handles timing-safe comparison internally.
    """
    return _pwd_context.verify(plain, hashed)


def password_needs_rehash(hashed: str) -> bool:
    """True if the stored hash uses a deprecated scheme – rehash on next login."""
    return _pwd_context.needs_update(hashed)


# ── JWT helpers ────────────────────────────────────────────────────

_ALGORITHM = settings.jwt_algorithm
_SECRET = settings.jwt_secret_key

# Claim names
_TYPE_ACCESS = "access"
_TYPE_REFRESH = "refresh"


def _make_token(data: dict, expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(tz=timezone.utc) + expires_delta
    payload["iat"] = datetime.now(tz=timezone.utc)
    return jwt.encode(payload, _SECRET, algorithm=_ALGORITHM)


def create_access_token(user_id: int, role: str) -> str:
    """
    Create a short-lived access token.
    Claims: sub (str user_id), role, type=access.
    """
    return _make_token(
        {"sub": str(user_id), "role": role, "type": _TYPE_ACCESS},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(user_id: int) -> str:
    """
    Create a longer-lived refresh token.
    Claims: sub (str user_id), type=refresh.
    Role is intentionally omitted – re-read from DB on refresh.
    """
    return _make_token(
        {"sub": str(user_id), "type": _TYPE_REFRESH},
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_access_token(token: str) -> Optional[dict]:
    """
    Decode and validate an access token.
    Returns the payload dict on success, None on any failure.
    """
    try:
        payload = jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
        if payload.get("type") != _TYPE_ACCESS:
            logger.warning("Token type mismatch: expected 'access'")
            return None
        if payload.get("sub") is None:
            return None
        return payload
    except JWTError as exc:
        logger.debug(f"Access token decode failed: {exc}")
        return None


def decode_refresh_token(token: str) -> Optional[dict]:
    """
    Decode and validate a refresh token.
    Returns the payload dict on success, None on any failure.
    """
    try:
        payload = jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
        if payload.get("type") != _TYPE_REFRESH:
            logger.warning("Token type mismatch: expected 'refresh'")
            return None
        if payload.get("sub") is None:
            return None
        return payload
    except JWTError as exc:
        logger.debug(f"Refresh token decode failed: {exc}")
        return None


# ── Password policy ────────────────────────────────────────────────

def validate_password_strength(password: str) -> list[str]:
    """
    Return a list of human-readable policy violation messages.
    Empty list means the password is acceptable.
    """
    errors: list[str] = []
    min_len = settings.password_min_length

    if len(password) < min_len:
        errors.append(f"Password must be at least {min_len} characters.")
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter.")
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter.")
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one digit.")

    return errors
