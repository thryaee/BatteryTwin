"""
auth/dependencies.py
--------------------
FastAPI dependency functions for authentication and role-based access control.

Usage:
    # Any authenticated user
    @router.get("/me")
    async def me(current_user: User = Depends(require_authenticated)):
        ...

    # Admin only
    @router.post("/admin/action")
    async def admin_action(current_user: User = Depends(require_admin)):
        ...

Token transport: Bearer token in the Authorization header.
  Authorization: Bearer <access_token>
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy.orm import Session

from auth.security import decode_access_token
from database.connection import get_db
from database.crud import get_user_by_id
from database.models import User, UserRole

# HTTPBearer extracts the token from the Authorization header.
# auto_error=False lets us return a cleaner 401 ourselves.
_bearer = HTTPBearer(auto_error=False)

_UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Not authenticated.",
    headers={"WWW-Authenticate": "Bearer"},
)

_FORBIDDEN = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You do not have permission to access this resource.",
)

_INACTIVE = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Your account is inactive. Please contact support.",
)


def _extract_user(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
) -> User:
    """Shared token → User resolution logic."""
    if credentials is None:
        raise _UNAUTHORIZED

    payload = decode_access_token(credentials.credentials)
    if payload is None:
        raise _UNAUTHORIZED

    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise _UNAUTHORIZED

    user = get_user_by_id(db, user_id)
    if user is None:
        raise _UNAUTHORIZED

    if not user.is_active:
        raise _INACTIVE

    return user


def require_authenticated(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: any active, authenticated user (user or admin).
    Raises HTTP 401 if token is missing/invalid.
    Raises HTTP 403 if account is inactive.
    """
    return _extract_user(credentials, db)


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: authenticated user with role == admin.
    Raises HTTP 403 if the user is a normal user.
    """
    user = _extract_user(credentials, db)
    if user.role != UserRole.admin:
        raise _FORBIDDEN
    return user


def require_user_role(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """
    Dependency: authenticated user with role == user (not admin).
    Use this on endpoints that normal users own; admins should use
    their own routes or require_authenticated as appropriate.
    """
    user = _extract_user(credentials, db)
    if user.role != UserRole.user:
        raise _FORBIDDEN
    return user


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User | None:
    """
    Dependency: returns User if a valid token is present, otherwise None.
    Useful for endpoints that behave differently for authenticated users
    but are still publicly accessible.
    """
    if credentials is None:
        return None
    payload = decode_access_token(credentials.credentials)
    if payload is None:
        return None
    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        return None
    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        return None
    return user
