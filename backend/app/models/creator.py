from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid

from app.database.db import Base


class CreatorProfile(Base):
    __tablename__ = "creator_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)

    # Each creator profile belongs to one user
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)

    display_name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    youtube = Column(String, nullable=True)
    website = Column(String, nullable=True)
    location = Column(String, nullable=True)
    gear = Column(String, nullable=True)
    awards = Column(JSONB, nullable=True, default=lambda: [])

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
