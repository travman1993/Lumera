from sqlalchemy import Column, String, Boolean, DateTime, Integer, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime, timezone
import uuid

from app.database.db import Base


class Film(Base):
    __tablename__ = "films"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    production_story = Column(Text, nullable=True)

    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    thumbnail_url = Column(String, nullable=True)   # vertical 2:3 poster
    cover_url = Column(String, nullable=True)        # horizontal 16:9 banner
    video_url = Column(String, nullable=True)

    duration = Column(String(30), nullable=True)
    budget = Column(String(50), nullable=True)
    gear_used = Column(Text, nullable=True)

    # JSON array of { name, role, social } objects
    contributors = Column(JSONB, nullable=True, default=lambda: [])

    views = Column(Integer, default=0, nullable=False)
    likes_count = Column(Integer, default=0, nullable=False)
    featured = Column(Boolean, default=False, nullable=False)

    # Visibility: 'draft' | 'unlisted' | 'public'
    # is_published stays in sync: True only when visibility='public'
    visibility = Column(String(20), nullable=False, default="draft")
    is_published = Column(Boolean, default=False, nullable=False)

    # Copyright acknowledgement logged at publish time
    copyright_acknowledged = Column(Boolean, default=False, nullable=False)
    copyright_acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    copyright_acknowledged_ip = Column(String(45), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
