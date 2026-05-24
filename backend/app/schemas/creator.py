from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Any


class Award(BaseModel):
    title: str
    festival: str
    year: str


class CreatorProfileUpdate(BaseModel):
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    gear: Optional[str] = None
    awards: Optional[list[Award]] = None


class CreatorProfileResponse(BaseModel):
    id: UUID
    user_id: UUID
    display_name: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    gear: Optional[str] = None
    awards: Optional[list[Any]] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CreatorPublicResponse(BaseModel):
    user_id: UUID
    username: str
    display_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None
    location: Optional[str] = None
    gear: Optional[str] = None
    awards: Optional[list[Any]] = None
    films: list = []
