from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.creator import CreatorProfile
from app.models.user import User
from app.schemas.creator import CreatorProfileUpdate


async def get_profile_by_user_id(db: AsyncSession, user_id: UUID) -> CreatorProfile | None:
    result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def upsert_creator_profile(
    db: AsyncSession, user_id: UUID, data: CreatorProfileUpdate
) -> CreatorProfile:
    profile = await get_profile_by_user_id(db, user_id)

    fields = data.model_dump(exclude_none=True)
    # Pydantic serialises Award objects into plain dicts, which is what JSONB expects
    if profile:
        for field, value in fields.items():
            setattr(profile, field, value)
    else:
        profile = CreatorProfile(user_id=user_id, **fields)
        db.add(profile)

        # Mark the user as a creator
        user_result = await db.execute(select(User).where(User.id == user_id))
        user = user_result.scalar_one_or_none()
        if user:
            user.is_creator = True

    await db.commit()
    await db.refresh(profile)
    return profile
