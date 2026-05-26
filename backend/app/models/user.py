from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

# Import base class
from app.database.db import Base

class User(Base):
    # Table Name
    __tablename__ = "users"

    # UUID
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False
    )

    email = Column(String, unique=True, index=True, nullable=False)

    username = Column(String, unique=True, index=True, nullable=False)

    # Hash version of password
    hashed_password = Column(String, nullable=False)

    # Verified email
    is_verified = Column(Boolean, default=False)

    # Account Active or not
    is_active = Column(Boolean, default=True)

    # Creator account flag — set True when user creates a creator profile
    is_creator = Column(Boolean, default=False)

    # Admin flag — set manually in the DB for site owners
    is_admin = Column(Boolean, default=False)

    # Auto timestamp
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))