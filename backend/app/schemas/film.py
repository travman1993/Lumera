from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any


class Contributor(BaseModel):
    name: str
    role: str
    social: Optional[str] = None


class FilmCreate(BaseModel):
    title: str
    description: Optional[str] = None
    production_story: Optional[str] = None
    category_id: UUID
    duration: Optional[str] = None
    budget: Optional[str] = None
    gear_used: Optional[str] = None
    contributors: Optional[List[Contributor]] = []
    is_published: bool = False


class FilmUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    production_story: Optional[str] = None
    category_id: Optional[UUID] = None
    duration: Optional[str] = None
    budget: Optional[str] = None
    gear_used: Optional[str] = None
    contributors: Optional[List[Contributor]] = None
    is_published: Optional[bool] = None
    featured: Optional[bool] = None


# Used for both list and detail responses — includes joined category/creator data
class FilmResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    description: Optional[str] = None
    production_story: Optional[str] = None
    category_id: UUID
    category_name: str
    creator_id: UUID
    creator_username: str
    creator_display_name: Optional[str] = None
    thumbnail_url: Optional[str] = None
    cover_url: Optional[str] = None
    video_url: Optional[str] = None
    duration: Optional[str] = None
    budget: Optional[str] = None
    gear_used: Optional[str] = None
    contributors: List[Any] = []
    views: int
    likes_count: int
    featured: bool
    is_published: bool
    created_at: datetime
    updated_at: datetime
