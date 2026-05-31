from sqlalchemy import Column, String, Boolean, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.database.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Account state
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    is_creator = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)

    # Email verification
    verification_token = Column(String(256), nullable=True)
    verification_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    verification_sent_at = Column(DateTime(timezone=True), nullable=True)

    # Agreements accepted at registration
    age_confirmed = Column(Boolean, default=False, nullable=False)
    age_confirmed_at = Column(DateTime(timezone=True), nullable=True)
    tos_accepted = Column(Boolean, default=False, nullable=False)
    tos_accepted_at = Column(DateTime(timezone=True), nullable=True)

    # Moderation
    copyright_strikes = Column(Integer, default=0, nullable=False)

    # Token version — increment to invalidate all existing JWTs (on suspend, pw change)
    token_version = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
