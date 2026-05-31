import uuid
import os
from uuid import UUID
from pathlib import Path
from datetime import datetime, timezone

import aiofiles
import filetype
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

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
    toggle_like,
    _build_film_response,
)
from app.services.user_service import get_user_by_id
from app.services.moderation_service import validate_text_field
from app.auth.jwt import verify_token
from app.models.film_report import FilmReport
from app.services import storage_service
from app.core.limiter import limiter

security = HTTPBearer()
optional_security = HTTPBearer(auto_error=False)

UPLOAD_DIR = Path("uploads")
THUMBNAIL_DIR = UPLOAD_DIR / "thumbnails"
VIDEO_DIR = UPLOAD_DIR / "videos"

MAX_IMAGE_BYTES = 10 * 1024 * 1024         # 10 MB
MAX_VIDEO_BYTES = 500 * 1024 * 1024        # 500 MB
MAX_AVATAR_BYTES = 5 * 1024 * 1024         # 5 MB

ALLOWED_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_CONTENT_TYPES = {"video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"}

# Detected MIME types accepted for images / videos (magic byte check)
ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp"}
ALLOWED_VIDEO_MIMES = {"video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"}

VALID_VISIBILITIES = {"draft", "unlisted", "public"}

router = APIRouter(prefix="/films", tags=["films"])


def _detect_mime(content: bytes) -> str | None:
    kind = filetype.guess(content[:8192])
    return kind.mime if kind else None


async def _handle_image_upload(file: UploadFile, local_dir: Path) -> str:
    if file.content_type not in ALLOWED_IMAGE_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported image type '{file.content_type}'.")
    content = await file.read()
    if len(content) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail="Image too large. Max 10 MB.")

    detected = _detect_mime(content)
    if not detected or detected not in ALLOWED_IMAGE_MIMES:
        raise HTTPException(status_code=415, detail="File contents do not match a supported image format.")

    if storage_service.cloudflare_ready():
        return await storage_service.upload_image(content, file.content_type)
    os.makedirs(local_dir, exist_ok=True)
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(local_dir / filename, "wb") as f:
        await f.write(content)
    return f"/uploads/{local_dir.name}/{filename}"


async def _handle_video_upload(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_VIDEO_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported video type '{file.content_type}'.")
    content = await file.read()
    if len(content) > MAX_VIDEO_BYTES:
        raise HTTPException(status_code=413, detail="Video too large. Max 500 MB via upload form.")

    detected = _detect_mime(content)
    if not detected or detected not in ALLOWED_VIDEO_MIMES:
        raise HTTPException(status_code=415, detail="File contents do not match a supported video format.")

    if storage_service.cloudflare_ready():
        return await storage_service.upload_video(content, file.filename or "video.mp4")
    os.makedirs(VIDEO_DIR, exist_ok=True)
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(VIDEO_DIR / filename, "wb") as f:
        await f.write(content)
    return f"/uploads/videos/{filename}"


# ── Public list routes ────────────────────────────────────────────────────────

@router.get("", response_model=list[FilmResponse])
async def list_films(db: AsyncSession = Depends(get_db)):
    return await get_all_films(db)


# /mine and /category/{slug} must be before /{film_id} so FastAPI doesn't
# try to match those literal strings as UUIDs.

@router.get("/mine", response_model=list[FilmResponse])
async def my_films(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token.")
    return await get_all_films_by_creator(db, UUID(user_id_str))


@router.get("/category/{slug}", response_model=list[FilmResponse])
async def films_by_category(slug: str, limit: int | None = None, db: AsyncSession = Depends(get_db)):
    return await get_films_by_category(db, slug, limit=limit)


@router.get("/{film_id}", response_model=FilmResponse)
async def get_film(film_id: UUID, db: AsyncSession = Depends(get_db)):
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")
    # Draft films are only accessible to their creator; for anonymous viewers treat as not found
    if film.visibility == "draft":
        raise HTTPException(status_code=404, detail="Film not found.")
    await increment_views(db, film)
    return await _build_film_response(db, film)


# ── Likes (auth required, toggleable) ────────────────────────────────────────

@router.post("/{film_id}/like", status_code=200)
@limiter.limit("30/minute")
async def like_film(
    request: Request,
    film_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="You must be logged in to like a film.")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")

    new_count, now_liked = await toggle_like(db, film_id, UUID(user_id_str))
    return {"likes_count": new_count, "liked": now_liked}


# ── Report ────────────────────────────────────────────────────────────────────

REPORT_REASONS = {"inappropriate", "spam", "copyright", "hate_speech", "harassment", "wrong_category", "other"}


@router.post("/{film_id}/report", status_code=201)
@limiter.limit("10/hour")
async def report_film(
    request: Request,
    film_id: UUID,
    reason: str = Form(...),
    details: str = Form(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="You must be logged in to submit a report.")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")
    if reason not in REPORT_REASONS:
        raise HTTPException(status_code=422, detail=f"Invalid reason. Choose from: {', '.join(sorted(REPORT_REASONS))}")

    report = FilmReport(
        film_id=film_id,
        reporter_id=UUID(user_id_str),
        reason=reason,
        details=details,
        status="pending",
    )
    db.add(report)
    await db.commit()
    return {"message": "Report submitted. Thank you."}


# ── Creator-only upload ───────────────────────────────────────────────────────

@router.post("", response_model=FilmResponse, status_code=201)
@limiter.limit("20/hour")
async def upload_film(
    request: Request,
    title: str = Form(...),
    description: str = Form(None),
    production_story: str = Form(None),
    category_id: str = Form(...),
    duration: str = Form(None),
    budget: str = Form(None),
    gear_used: str = Form(None),
    contributors: str = Form("[]"),
    visibility: str = Form("draft"),
    copyright_acknowledged: bool = Form(False),
    thumbnail: UploadFile = File(None),
    cover: UploadFile = File(None),
    video: UploadFile = File(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user = await get_user_by_id(db, user_id_str)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token.")

    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email address before uploading films.",
        )

    # Validate visibility value
    if visibility not in VALID_VISIBILITIES:
        raise HTTPException(status_code=422, detail="visibility must be 'draft', 'unlisted', or 'public'.")

    # Copyright acknowledgement required when publishing publicly
    if visibility == "public" and not copyright_acknowledged:
        raise HTTPException(
            status_code=400,
            detail="You must acknowledge copyright ownership before publishing a film publicly.",
        )

    # Profanity screening on text fields
    try:
        validate_text_field("title", title)
        validate_text_field("description", description)
        validate_text_field("production_story", production_story)
        validate_text_field("gear_used", gear_used)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Promote to creator on first upload
    if not user.is_creator:
        user.is_creator = True
        await db.commit()

    thumbnail_url = await _handle_image_upload(thumbnail, THUMBNAIL_DIR) if thumbnail and thumbnail.filename else None
    cover_url = await _handle_image_upload(cover, THUMBNAIL_DIR.parent / "covers") if cover and cover.filename else None
    video_url = await _handle_video_upload(video) if video and video.filename else None

    is_published = visibility == "public"
    client_ip = request.headers.get("CF-Connecting-IP") or (request.client.host if request.client else None)

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
        visibility=visibility,
        is_published=is_published,
        thumbnail_url=thumbnail_url,
        cover_url=cover_url,
        video_url=video_url,
        copyright_acknowledged=copyright_acknowledged,
        copyright_acknowledged_at=datetime.now(timezone.utc) if copyright_acknowledged else None,
        copyright_acknowledged_ip=client_ip if copyright_acknowledged else None,
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
        raise HTTPException(status_code=401, detail="Invalid token.")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")
    if str(film.creator_id) != user_id_str:
        raise HTTPException(status_code=403, detail="Not your film.")

    if data.visibility and data.visibility not in VALID_VISIBILITIES:
        raise HTTPException(status_code=422, detail="visibility must be 'draft', 'unlisted', or 'public'.")

    # Profanity screening on editable text fields
    try:
        validate_text_field("title", data.title)
        validate_text_field("description", data.description)
        validate_text_field("production_story", data.production_story)
        validate_text_field("gear_used", data.gear_used)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

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
        raise HTTPException(status_code=401, detail="Invalid token.")

    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")
    if str(film.creator_id) != user_id_str:
        raise HTTPException(status_code=403, detail="Not your film.")

    await delete_film(db, film)
