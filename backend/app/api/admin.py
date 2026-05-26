from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.auth.jwt import verify_token
from app.services.user_service import get_user_by_id
from app.services.film_service import get_film_by_id, delete_film
from app.models.film_report import FilmReport

security = HTTPBearer()

router = APIRouter(prefix="/admin", tags=["admin"])


async def _require_admin(credentials: HTTPAuthorizationCredentials, db: AsyncSession):
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await get_user_by_id(db, user_id)
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/reports")
async def list_reports(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    result = await db.execute(select(FilmReport).order_by(FilmReport.created_at.desc()))
    reports = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "film_id": str(r.film_id),
            "reporter_id": str(r.reporter_id) if r.reporter_id else None,
            "reason": r.reason,
            "details": r.details,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.delete("/films/{film_id}", status_code=204)
async def admin_delete_film(
    film_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found")
    await delete_film(db, film)
