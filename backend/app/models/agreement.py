from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
import uuid

from app.database.db import Base


class AgreementVersion(Base):
    __tablename__ = "agreement_versions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    version = Column(String(20), unique=True, nullable=False)   # e.g. "1.0"
    title = Column(String(255), nullable=False)
    content_url = Column(String(512), nullable=False)           # link to the hosted text
    effective_date = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UserAgreement(Base):
    __tablename__ = "user_agreements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    agreement_version_id = Column(
        UUID(as_uuid=True), ForeignKey("agreement_versions.id"), nullable=False
    )
    accepted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    accepted_ip = Column(String(45), nullable=True)

    __table_args__ = (
        UniqueConstraint("user_id", "agreement_version_id", name="uq_user_agreements_user_version"),
    )
