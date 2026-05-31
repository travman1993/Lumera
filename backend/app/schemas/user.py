import re
from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    age_confirmed: bool = False
    tos_accepted: bool = False

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters.")
        if len(v) > 30:
            raise ValueError("Username must be 30 characters or fewer.")
        if not re.match(r"^[a-zA-Z0-9_.\-]+$", v):
            raise ValueError(
                "Username may only contain letters, numbers, underscores, periods, and hyphens."
            )
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters.")
        if len(v) > 128:
            raise ValueError("Password must be 128 characters or fewer.")
        return v

    @field_validator("age_confirmed")
    @classmethod
    def must_confirm_age(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must confirm that you are at least 13 years of age.")
        return v

    @field_validator("tos_accepted")
    @classmethod
    def must_accept_tos(cls, v: bool) -> bool:
        if not v:
            raise ValueError("You must accept the Terms of Service to create an account.")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    is_verified: bool
    is_active: bool
    is_creator: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_id: str | None = None
