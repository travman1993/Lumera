import uuid
import os
from uuid import UUID
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.schemas.film import FilmResponse, FilmUpdate
from app.services.film_service import (
    get_all_films,
    get_films_by_category,
    get_film_by_id,
    get_all_films_by_creator,
    create_film,
    update_film,
    delete_film,
    increment_views,
    increment_likes,
    _build_film_response,
)
from app.services.user_service import get_user_by_id
from app.auth.jwt import verify_token
from app.models.film_report import FilmReport
from app.services import storage_service

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

UPLOAD_DIR = Path("uploads")
THUMBNAIL_DIR = UPLOAD_DIR / "thumbnails"
VIDEO_DIR = UPLOAD_DIR / "videos"

MAX_IMAGE_BYTES = 10 * 1024 * 1024        # 10 MB
MAX_VIDEO_BYTES = 500 * 1024 * 1024       # 500 MB via backend proxy; use direct upload for larger
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"}

router = APIRouter(prefix="/films", tags=["films"])


async def _handle_image_upload(file: UploadFile, local_dir: Path) -> str:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported image type '{file.content_type}'.")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large. Max 10 MB.")
    if storage_service.cloudflare_ready():
        return await storage_service.upload_image(content, file.content_type)
    # Local fallback for development
    os.makedirs(local_dir, exist_ok=True)
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(local_dir / filename, "wb") as f:
        await f.write(content)
    return f"/uploads/{local_dir.name}/{filename}"


async def _handle_video_upload(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported video type '{file.content_type}'.")
    content = await file.read()
    if len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=413, detail="Video too large. Max 500 MB via upload form.")
    if storage_service.cloudflare_ready():
        return await storage_service.upload_video(content, file.filename or "video.mp4")
    # Local fallback for development
    os.makedirs(VIDEO_DIR, exist_ok=True)
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(VIDEO_DIR / filename, "wb") as f:
        await f.write(content)
    return f"/uploads/videos/{filename}"


# --- Public list routes ---

@router.get("", response_model=list[FilmResponse])
async def list_films(db: AsyncSession = Depends(get_db)):
    return await get_all_films(db)


# /mine and /category/{slug} must be defined BEFORE /{film_id} so FastAPI
# doesn't try to match those literal strings as UUIDs.

@router.get("/mine", response_model=list[FilmResponse])
async def my_films(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    return await get_all_films_by_creator(db, UUID(user_id_str))


@router.get("/category/{slug}", response_model=list[FilmResponse])
async def films_by_category(slug: str, db: AsyncSession = Depends(get_db)):
    return await get_films_by_category(db, slug)


@router.get("/{film_id}", response_model=FilmResponse)
async def get_film(film_id: UUID, db: AsyncSession = Depends(get_db)):
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    await increment_views(db, film)
    return await _build_film_response(db, film)


# --- Likes (no auth required for MVP) ---

@router.post("/{film_id}/like", status_code=200)
async def like_film(film_id: UUID, db: AsyncSession = Depends(get_db)):
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    await increment_likes(db, film)
    return {"likes_count": film.likes_count}


# --- Report ---

REPORT_REASONS = {"inappropriate", "spam", "copyright", "wrong_category", "other"}

@router.post("/{film_id}/report", status_code=201)
async def report_film(
    film_id: UUID,
    reason: str = Form(...),
    details: str = Form(None),
    credentials: HTTPAuthorizationCredentials = Depends(optional_security),
    db: AsyncSession = Depends(get_db),
):
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    if reason not in REPORT_REASONS:
        raise HTTPException(status_code=422, detail=f"Invalid reason. Choose from: {', '.join(REPORT_REASONS)}")

    reporter_id = None
    if credentials:
        user_id_str = verify_token(credentials.credentials)
        if user_id_str:
            reporter_id = UUID(user_id_str)

    report = FilmReport(film_id=film_id, reporter_id=reporter_id, reason=reason, details=details)
    db.add(report)
    await db.commit()
    return {"message": "Report submitted. Thank you."}


# --- Creator-only routes ---

@router.post("", response_model=FilmResponse, status_code=201)
async def upload_film(
    title: str = Form(...),
    description: str = Form(None),
    production_story: str = Form(None),
    category_id: str = Form(...),
    duration: str = Form(None),
    budget: str = Form(None),
    gear_used: str = Form(None),
    contributors: str = Form("[]"),
    is_published: bool = Form(False),
    thumbnail: UploadFile = File(None),
    cover: UploadFile = File(None),
    video: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await get_user_by_id(db, user_id_str)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")

    # Every Lumera user is a creator — promote automatically on first upload
    if not user.is_creator:
        user.is_creator = True
        await db.commit()

    thumbnail_url = await _handle_image_upload(thumbnail, THUMBNAIL_DIR) if thumbnail and thumbnail.filename else None
    cover_url = await _handle_image_upload(cover, THUMBNAIL_DIR.parent / "covers") if cover and cover.filename else None
    video_url = await _handle_video_upload(video) if video and video.filename else None

    film = await create_film(
        db=db,
        creator_id=UUID(user_id_str),
        title=title,
        description=description,
        production_story=production_story,
        category_id=UUID(category_id),
        duration=duration,
        budget=budget,
        gear_used=gear_used,
        contributors_json=contributors,
        is_published=is_published,
        thumbnail_url=thumbnail_url,
        cover_url=cover_url,
        video_url=video_url,
    )
    return await _build_film_response(db, film)


@router.put("/{film_id}", response_model=FilmResponse)
async def edit_film(
    film_id: UUID,
    data: FilmUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    if str(film.creator_id) != user_id_str:
        raise HTTPException(status_code=403, detail="Not your film")

    update_data = data.model_dump(exclude_none=True)
    if "contributors" in update_data:
        update_data["contributors"] = [c.model_dump() for c in (data.contributors or [])]

    film = await update_film(db, film, update_data)
    return await _build_film_response(db, film)


@router.delete("/{film_id}", status_code=204)
async def remove_film(
    film_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    if str(film.creator_id) != user_id_str:
        raise HTTPException(status_code=403, detail="Not your film")

    await delete_film(db, film)
