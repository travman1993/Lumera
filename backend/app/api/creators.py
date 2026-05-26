import uuid
import os
from uuid import UUID
from pathlib import Path

import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.db import get_db
from app.schemas.creator import CreatorProfileUpdate, CreatorProfileResponse, CreatorPublicResponse
from app.services.creator_service import get_profile_by_user_id, upsert_creator_profile
from app.services.user_service import get_user_by_id
from app.services.film_service import get_films_by_creator
from app.services import storage_service
from app.auth.jwt import verify_token

security = HTTPBearer()

AVATAR_DIR = Path("uploads") / "avatars"
ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_AVATAR_BYTES = 5 * 1024 * 1024  # 5 MB

router = APIRouter(prefix="/creators", tags=["creators"])


async def _save_avatar(file: UploadFile) -> str:
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(status_code=415, detail="Avatar must be a JPEG, PNG, or WebP image.")
    content = await file.read()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(status_code=413, detail="Avatar too large. Max 5 MB.")
    if storage_service.cloudflare_ready():
        return await storage_service.upload_image(content, file.content_type)
    # Local fallback for development
    os.makedirs(AVATAR_DIR, exist_ok=True)
    ext = Path(file.filename or "avatar.jpg").suffix or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    async with aiofiles.open(AVATAR_DIR / filename, "wb") as f:
        await f.write(content)
    return f"/uploads/avatars/{filename}"


# POST /me/avatar must be before GET /{user_id} to avoid path conflicts
@router.post("/me/avatar")
async def upload_creator_avatar(
    avatar: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")
    avatar_url = await _save_avatar(avatar)
    return {"avatar_url": avatar_url}


@router.put("/me", response_model=CreatorProfileResponse)
async def update_my_profile(
    data: CreatorProfileUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id_str = verify_token(credentials.credentials)
    if not user_id_str:
        raise HTTPException(status_code=401, detail="Invalid token")

    profile = await upsert_creator_profile(db, UUID(user_id_str), data)
    return profile


@router.get("/{user_id}", response_model=CreatorPublicResponse)
async def get_creator(user_id: UUID, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="Creator not found")

    profile = await get_profile_by_user_id(db, user_id)
    films = await get_films_by_creator(db, user_id)

    return CreatorPublicResponse(
        user_id=user.id,
        username=user.username,
        display_name=profile.display_name if profile else None,
        bio=profile.bio if profile else None,
        avatar_url=profile.avatar_url if profile else None,
        instagram=profile.instagram if profile else None,
        youtube=profile.youtube if profile else None,
        website=profile.website if profile else None,
        location=profile.location if profile else None,
        gear=profile.gear if profile else None,
        awards=profile.awards if profile else None,
        films=[f.model_dump() for f in films],
    )
