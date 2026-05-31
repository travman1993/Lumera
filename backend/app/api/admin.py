from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.db import get_db
from app.auth.jwt import verify_token
from app.services.user_service import get_user_by_id
from app.services.film_service import get_film_by_id, delete_film
from app.models.film_report import FilmReport
from app.models.user_report import UserReport
from app.models.user import User
from app.models.film import Film

security = HTTPBearer()

router = APIRouter(prefix="/admin", tags=["admin"])


async def _require_admin(credentials: HTTPAuthorizationCredentials, db: AsyncSession) -> User:
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")
    user = await get_user_by_id(db, user_id)
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user


# ── Film reports ──────────────────────────────────────────────────────────────

@router.get("/reports")
async def list_film_reports(
    status: str | None = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    query = select(FilmReport).order_by(FilmReport.created_at.desc())
    if status:
        query = query.where(FilmReport.status == status)
    result = await db.execute(query)
    reports = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "film_id": str(r.film_id),
            "reporter_id": str(r.reporter_id) if r.reporter_id else None,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "action_taken": r.action_taken,
            "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.patch("/reports/{report_id}")
async def update_film_report(
    report_id: UUID,
    status: str = Body(...),
    action_taken: str | None = Body(None),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    admin = await _require_admin(credentials, db)
    result = await db.execute(select(FilmReport).where(FilmReport.id == report_id))
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found.")

    valid_statuses = {"pending", "reviewing", "resolved", "dismissed"}
    if status not in valid_statuses:
        raise HTTPException(status_code=422, detail=f"status must be one of: {', '.join(valid_statuses)}")

    report.status = status
    report.reviewed_by = admin.id
    report.reviewed_at = datetime.now(timezone.utc)
    if action_taken:
        report.action_taken = action_taken
    await db.commit()
    return {"message": "Report updated."}


# ── User reports ──────────────────────────────────────────────────────────────

@router.get("/user-reports")
async def list_user_reports(
    status: str | None = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    query = select(UserReport).order_by(UserReport.created_at.desc())
    if status:
        query = query.where(UserReport.status == status)
    result = await db.execute(query)
    reports = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "reported_user_id": str(r.reported_user_id),
            "reporter_id": str(r.reporter_id) if r.reporter_id else None,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "action_taken": r.action_taken,
            "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


# ── Film management ───────────────────────────────────────────────────────────

@router.get("/films")
async def list_all_films(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    result = await db.execute(select(Film).order_by(Film.created_at.desc()))
    films = result.scalars().all()
    return [
        {
            "id": str(f.id),
            "title": f.title,
            "creator_id": str(f.creator_id),
            "visibility": f.visibility,
            "is_published": f.is_published,
            "views": f.views,
            "likes_count": f.likes_count,
            "created_at": f.created_at.isoformat(),
        }
        for f in films
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
        raise HTTPException(status_code=404, detail="Film not found.")
    await delete_film(db, film)


@router.patch("/films/{film_id}/unpublish", status_code=200)
async def admin_unpublish_film(
    film_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    film = await get_film_by_id(db, film_id)
    if not film:
        raise HTTPException(status_code=404, detail="Film not found.")
    film.visibility = "draft"
    film.is_published = False
    await db.commit()
    return {"message": "Film unpublished."}


# ── User management ───────────────────────────────────────────────────────────

@router.get("/users")
async def list_users(
    q: str | None = None,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    query = select(User).order_by(User.created_at.desc())
    if q:
        from sqlalchemy import or_
        query = query.where(
            or_(User.username.ilike(f"%{q}%"), User.email.ilike(f"%{q}%"))
        )
    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "username": u.username,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "is_creator": u.is_creator,
            "is_admin": u.is_admin,
            "copyright_strikes": u.copyright_strikes,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.post("/users/{user_id}/suspend", status_code=200)
async def suspend_user(
    user_id: UUID,
    reason: str = Body(...),
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    admin = await _require_admin(credentials, db)
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.is_admin:
        raise HTTPException(status_code=403, detail="Cannot suspend an admin account.")

    user.is_active = False
    # Increment token_version to invalidate all existing JWTs for this user
    user.token_version = (user.token_version or 0) + 1
    await db.commit()
    return {"message": f"User @{user.username} suspended."}


@router.post("/users/{user_id}/restore", status_code=200)
async def restore_user(
    user_id: UUID,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    user = await get_user_by_id(db, str(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    user.is_active = True
    await db.commit()
    return {"message": f"User @{user.username} restored."}


# ── Dashboard stats ───────────────────────────────────────────────────────────

@router.get("/stats")
async def dashboard_stats(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    await _require_admin(credentials, db)
    from sqlalchemy import func

    pending_film_reports = await db.execute(
        select(func.count()).select_from(FilmReport).where(FilmReport.status == "pending")
    )
    pending_user_reports = await db.execute(
        select(func.count()).select_from(UserReport).where(UserReport.status == "pending")
    )
    total_users = await db.execute(select(func.count()).select_from(User))
    total_films = await db.execute(select(func.count()).select_from(Film).where(Film.visibility == "public"))

    return {
        "pending_film_reports": pending_film_reports.scalar(),
        "pending_user_reports": pending_user_reports.scalar(),
        "total_users": total_users.scalar(),
        "total_public_films": total_films.scalar(),
    }
