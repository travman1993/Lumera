from pydantic import BaseModel, EmailStr
from datetime import datetime
from uuid import UUID

# Register
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

# Login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Response
class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    is_verified: bool
    is_active: bool
    is_creator: bool
    created_at: datetime

    model_config = {"from_attributes": True}

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

# Data encoded inside JWT
class TokenData(BaseModel):
    user_id: str | None = None