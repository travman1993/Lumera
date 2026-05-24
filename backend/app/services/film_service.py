import re
import json
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.film import Film
from app.models.category import Category
from app.models.user import User
from app.models.creator import CreatorProfile
from app.schemas.film import FilmResponse


def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


async def _build_film_response(db: AsyncSession, film: Film) -> FilmResponse:
    cat_result = await db.execute(select(Category).where(Category.id == film.category_id))
    category = cat_result.scalar_one_or_none()

    user_result = await db.execute(select(User).where(User.id == film.creator_id))
    user = user_result.scalar_one_or_none()

    profile_result = await db.execute(
        select(CreatorProfile).where(CreatorProfile.user_id == film.creator_id)
    )
    profile = profile_result.scalar_one_or_none()

    return FilmResponse(
        id=film.id,
        title=film.title,
        slug=film.slug,
        description=film.description,
        production_story=film.production_story,
        category_id=film.category_id,
        category_name=category.name if category else "",
        creator_id=film.creator_id,
        creator_username=user.username if user else "",
        creator_display_name=profile.display_name if profile else None,
        thumbnail_url=film.thumbnail_url,
        cover_url=film.cover_url,
        video_url=film.video_url,
        duration=film.duration,
        budget=film.budget,
        gear_used=film.gear_used,
        contributors=film.contributors or [],
        views=film.views,
        likes_count=film.likes_count,
        featured=film.featured,
        is_published=film.is_published,
        created_at=film.created_at,
        updated_at=film.updated_at,
    )


async def get_all_films(db: AsyncSession) -> list[FilmResponse]:
    result = await db.execute(
        select(Film).where(Film.is_published == True).order_by(Film.created_at.desc())
    )
    films = result.scalars().all()
    return [await _build_film_response(db, f) for f in films]


async def get_films_by_category(db: AsyncSession, slug: str) -> list[FilmResponse]:
    cat_result = await db.execute(select(Category).where(Category.slug == slug))
    category = cat_result.scalar_one_or_none()
    if not category:
        return []

    result = await db.execute(
        select(Film)
        .where(Film.category_id == category.id, Film.is_published == True)
        .order_by(Film.created_at.desc())
    )
    films = result.scalars().all()
    return [await _build_film_response(db, f) for f in films]


async def get_film_by_id(db: AsyncSession, film_id: UUID) -> Film | None:
    result = await db.execute(select(Film).where(Film.id == film_id))
    return result.scalar_one_or_none()


async def get_film_by_slug(db: AsyncSession, slug: str) -> Film | None:
    result = await db.execute(select(Film).where(Film.slug == slug))
    return result.scalar_one_or_none()


async def get_all_films_by_creator(db: AsyncSession, creator_id: UUID) -> list[FilmResponse]:
    """Returns ALL films for a creator, including drafts — used by the dashboard."""
    result = await db.execute(
        select(Film)
        .where(Film.creator_id == creator_id)
        .order_by(Film.created_at.desc())
    )
    films = result.scalars().all()
    return [await _build_film_response(db, f) for f in films]


async def get_films_by_creator(db: AsyncSession, creator_id: UUID) -> list[FilmResponse]:
    result = await db.execute(
        select(Film)
        .where(Film.creator_id == creator_id, Film.is_published == True)
        .order_by(Film.created_at.desc())
    )
    films = result.scalars().all()
    return [await _build_film_response(db, f) for f in films]


async def create_film(
    db: AsyncSession,
    creator_id: UUID,
    title: str,
    description: str | None,
    production_story: str | None,
    category_id: UUID,
    duration: str | None,
    budget: str | None,
    gear_used: str | None,
    contributors_json: str,
    is_published: bool,
    thumbnail_url: str | None,
    cover_url: str | None,
    video_url: str | None,
) -> Film:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1

    # Ensure slug uniqueness
    while await get_film_by_slug(db, slug):
        slug = f"{base_slug}-{counter}"
        counter += 1

    try:
        contributors = json.loads(contributors_json) if contributors_json else []
    except (json.JSONDecodeError, TypeError):
        contributors = []

    film = Film(
        title=title,
        slug=slug,
        description=description,
        production_story=production_story,
        category_id=category_id,
        creator_id=creator_id,
        duration=duration,
        budget=budget,
        gear_used=gear_used,
        contributors=contributors,
        is_published=is_published,
        thumbnail_url=thumbnail_url,
        cover_url=cover_url,
        video_url=video_url,
    )
    db.add(film)
    await db.commit()
    await db.refresh(film)
    return film


async def update_film(
    db: AsyncSession, film: Film, data: dict
) -> Film:
    for field, value in data.items():
        if value is not None:
            setattr(film, field, value)
    await db.commit()
    await db.refresh(film)
    return film


async def delete_film(db: AsyncSession, film: Film) -> None:
    await db.delete(film)
    await db.commit()


async def increment_views(db: AsyncSession, film: Film) -> None:
    film.views = (film.views or 0) + 1
    await db.commit()


async def increment_likes(db: AsyncSession, film: Film) -> None:
    film.likes_count = (film.likes_count or 0) + 1
    await db.commit()
