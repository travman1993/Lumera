import secrets
import bcrypt
from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.user import User
from app.schemas.user import UserCreate


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_username(db: AsyncSession, username: str) -> User | None:
    result = await db.execute(select(User).where(User.username == username))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, user_data: UserCreate) -> User:
    hashed = hash_password(user_data.password)
    now = datetime.now(timezone.utc)

    verification_token = secrets.token_urlsafe(32)
    verification_expires = now + timedelta(hours=24)

    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed,
        age_confirmed=user_data.age_confirmed,
        age_confirmed_at=now if user_data.age_confirmed else None,
        tos_accepted=user_data.tos_accepted,
        tos_accepted_at=now if user_data.tos_accepted else None,
        verification_token=verification_token,
        verification_token_expires_at=verification_expires,
        verification_sent_at=now,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    from app.services.email_service import send_verification_email
    send_verification_email(new_user.email, new_user.username, verification_token)

    return new_user


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    return result.scalar_one_or_none()
