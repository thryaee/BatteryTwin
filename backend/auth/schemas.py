"""
auth/schemas.py
---------------
Pydantic request/response schemas for all authentication endpoints.

Rules enforced here:
  - Passwords are validated at the schema level so errors surface early.
  - Role is NEVER accepted as a field in registration requests.
  - Response schemas NEVER include hashed_password or reset tokens.
"""

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field, model_validator

from config import settings
from database.models import UserRole


# ── Registration ───────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(
        min_length=2,
        max_length=128,
        examples=["Jane Smith"],
    )
    email: EmailStr
    password: str = Field(min_length=settings.password_min_length)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self

    model_config = {"json_schema_extra": {"examples": [
        {
            "full_name": "Jane Smith",
            "email": "jane@example.com",
            "password": "Secure123",
            "confirm_password": "Secure123",
        }
    ]}}


# ── Login ──────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

    model_config = {"json_schema_extra": {"examples": [
        {"email": "jane@example.com", "password": "Secure123", "remember_me": False}
    ]}}


class AdminLoginRequest(BaseModel):
    email: EmailStr
    password: str

    model_config = {"json_schema_extra": {"examples": [
        {"email": "admin@batterytwin.local", "password": "AdminPass123"}
    ]}}


# ── Token responses ────────────────────────────────────────────────

class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int        # seconds until access token expires
    role: UserRole


class RefreshRequest(BaseModel):
    refresh_token: str


# ── User profile (safe – no secrets) ──────────────────────────────

class UserProfile(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── Password reset ─────────────────────────────────────────────────

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=settings.password_min_length)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "ResetPasswordRequest":
        if self.new_password != self.confirm_password:
            raise ValueError("Passwords do not match.")
        return self


# ── Generic messages ───────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
