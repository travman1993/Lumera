from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.category import Category


async def get_all_categories(db: AsyncSession) -> list[Category]:
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


async def get_category_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def seed_categories(db: AsyncSession) -> None:
    default_categories = [
        {"name": "Short Films", "slug": "short-films"},
        {"name": "Documentaries", "slug": "documentaries"},
        {"name": "Sports", "slug": "sports"},
        {"name": "Music Videos", "slug": "music-videos"},
        {"name": "Commercials", "slug": "commercials"},
        {"name": "Experimental", "slug": "experimental"},
        {"name": "Fashion", "slug": "fashion"},
        {"name": "Animation", "slug": "animation"},
    ]

    for cat in default_categories:
        existing = await get_category_by_slug(db, cat["slug"])
        if not existing:
            db.add(Category(name=cat["name"], slug=cat["slug"]))

    await db.commit()
