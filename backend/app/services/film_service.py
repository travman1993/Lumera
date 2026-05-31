import re
import json
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError

from app.models.film import Film
from app.models.film_like import FilmLike
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
        visibility=film.visibility or "draft",
        is_published=film.is_published,
        created_at=film.created_at,
        updated_at=film.updated_at,
    )


async def get_all_films(db: AsyncSession) -> list[FilmResponse]:
    result = await db.execute(
        select(Film).where(Film.visibility == "public").order_by(Film.created_at.desc())
    )
    films = result.scalars().all()
    return [await _build_film_response(db, f) for f in films]


async def get_films_by_category(
    db: AsyncSession, slug: str, limit: int | None = None
) -> list[FilmResponse]:
    cat_result = await db.execute(select(Category).where(Category.slug == slug))
    category = cat_result.scalar_one_or_none()
    if not category:
        return []

    query = (
        select(Film)
        .where(Film.category_id == category.id, Film.visibility == "public")
        .order_by(func.random())
    )
    if limit:
        query = query.limit(limit)

    result = await db.execute(query)
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
        .where(Film.creator_id == creator_id, Film.visibility == "public")
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
    visibility: str,
    is_published: bool,
    thumbnail_url: str | None,
    cover_url: str | None,
    video_url: str | None,
    copyright_acknowledged: bool = False,
    copyright_acknowledged_at: datetime | None = None,
    copyright_acknowledged_ip: str | None = None,
) -> Film:
    base_slug = slugify(title)
    slug = base_slug
    counter = 1

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
        visibility=visibility,
        is_published=is_published,
        copyright_acknowledged=copyright_acknowledged,
        copyright_acknowledged_at=copyright_acknowledged_at,
        copyright_acknowledged_ip=copyright_acknowledged_ip,
        thumbnail_url=thumbnail_url,
        cover_url=cover_url,
        video_url=video_url,
    )
    db.add(film)
    await db.commit()
    await db.refresh(film)
    return film


async def update_film(db: AsyncSession, film: Film, data: dict) -> Film:
    # Keep is_published in sync with visibility
    if "visibility" in data:
        data["is_published"] = data["visibility"] == "public"
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


async def toggle_like(
    db: AsyncSession, film_id: UUID, user_id: UUID
) -> tuple[int, bool]:
    """
    Toggle like for a user on a film.
    Returns (new_likes_count, now_liked).
    now_liked=True means just liked; False means just unliked.
    """
    film = await get_film_by_id(db, film_id)
    if not film:
        return 0, False

    existing = await db.execute(
        select(FilmLike).where(
            FilmLike.film_id == film_id, FilmLike.user_id == user_id
        )
    )
    like = existing.scalar_one_or_none()

    if like:
        await db.delete(like)
        film.likes_count = max(0, (film.likes_count or 0) - 1)
        await db.commit()
        return film.likes_count, False
    else:
        db.add(FilmLike(film_id=film_id, user_id=user_id))
        film.likes_count = (film.likes_count or 0) + 1
        try:
            await db.commit()
        except IntegrityError:
            # Race condition: another request already inserted the like
            await db.rollback()
            film = await get_film_by_id(db, film_id)
            return film.likes_count if film else 0, False
        return film.likes_count, True
