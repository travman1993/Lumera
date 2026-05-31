from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.requests import Request

from app.database.db import get_db
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token
from app.services.user_service import (
    get_user_by_email,
    get_user_by_username,
    get_user_by_id,
    create_user,
    verify_password,
)
from app.auth.jwt import create_access_token, verify_token
from app.services.moderation_service import validate_username_format
from app.core.limiter import limiter

security = HTTPBearer()

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("5/10minutes")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Username format, length, reserved list, and profanity — all in one call
    try:
        validate_username_format(user_data.username)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Profanity check on display fields that arrive at registration
    # (username covered above; nothing else is collected yet)

    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered.")

    existing_username = await get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken.")

    # age_confirmed and tos_accepted are validated by Pydantic — if we reached here they're True
    user = await create_user(db, user_data)
    return user


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
async def login(request: Request, user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, user_data.email)

    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been deactivated.",
        )

    # Include token_version so we can invalidate JWTs on suspend/password change
    access_token = create_access_token(
        data={"sub": str(user.id), "tv": user.token_version}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return user


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    from app.models.user import User

    result = await db.execute(
        select(User).where(User.verification_token == token)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link.")

    if user.verification_token_expires_at and user.verification_token_expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Verification link has expired. Please request a new one.")

    user.is_verified = True
    user.verification_token = None
    user.verification_token_expires_at = None
    await db.commit()
    return {"message": "Email verified successfully. You can now upload films."}


@router.post("/resend-verification")
@limiter.limit("3/15minutes")
async def resend_verification(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    import secrets
    from datetime import timedelta

    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.is_verified:
        raise HTTPException(status_code=400, detail="Email is already verified.")

    # Enforce a cooldown between resend requests
    if user.verification_sent_at:
        elapsed = (datetime.now(timezone.utc) - user.verification_sent_at).total_seconds()
        if elapsed < 300:
            wait = int(300 - elapsed)
            raise HTTPException(
                status_code=429,
                detail=f"Please wait {wait} seconds before requesting another verification email.",
            )

    token = secrets.token_urlsafe(32)
    user.verification_token = token
    user.verification_token_expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    user.verification_sent_at = datetime.now(timezone.utc)
    await db.commit()

    from app.services.email_service import send_verification_email
    send_verification_email(user.email, user.username, token)

    return {"message": "Verification email sent."}


# ── Account deletion ──────────────────────────────────────────────────────────

@router.delete("/me", status_code=200)
@limiter.limit("3/day")
async def delete_account(
    request: Request,
    confirm_username: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if confirm_username.strip().lower() != user.username.lower():
        raise HTTPException(status_code=400, detail="Username confirmation does not match.")

    # Soft delete — anonymise PII, keep audit records intact
    import uuid as _uuid
    anon_id = str(_uuid.uuid4())[:8]
    user.email = f"deleted_{anon_id}@deleted.lumera"
    user.username = f"deleted_{anon_id}"
    user.hashed_password = "DELETED"
    user.is_active = False
    user.is_creator = False
    user.verification_token = None
    user.token_version = (user.token_version or 0) + 1

    # Unpublish all their films
    from sqlalchemy import select as _select
    from app.models.film import Film
    films_result = await db.execute(
        _select(Film).where(Film.creator_id == user.id)
    )
    for film in films_result.scalars().all():
        film.visibility = "draft"
        film.is_published = False

    await db.commit()
    return {"message": "Your account has been deleted."}


# ── Creator Agreement ─────────────────────────────────────────────────────────

@router.get("/agreement/current")
async def get_current_agreement(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select as _select
    from app.models.agreement import AgreementVersion
    result = await db.execute(
        _select(AgreementVersion).order_by(AgreementVersion.effective_date.desc()).limit(1)
    )
    version = result.scalar_one_or_none()
    if not version:
        return {"version": None}
    return {
        "id": str(version.id),
        "version": version.version,
        "title": version.title,
        "content_url": version.content_url,
        "effective_date": version.effective_date.isoformat(),
    }


@router.get("/agreement/status")
async def get_agreement_status(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    """Returns whether the current user has accepted the latest agreement version."""
    from sqlalchemy import select as _select
    from app.models.agreement import AgreementVersion, UserAgreement

    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    version_result = await db.execute(
        _select(AgreementVersion).order_by(AgreementVersion.effective_date.desc()).limit(1)
    )
    current = version_result.scalar_one_or_none()
    if not current:
        return {"accepted": True, "version": None}

    accepted_result = await db.execute(
        _select(UserAgreement).where(
            UserAgreement.user_id == user_id,
            UserAgreement.agreement_version_id == current.id,
        )
    )
    accepted = accepted_result.scalar_one_or_none() is not None
    return {
        "accepted": accepted,
        "version": current.version,
        "agreement_id": str(current.id),
        "title": current.title,
        "content_url": current.content_url,
    }


@router.post("/agreement/accept", status_code=201)
async def accept_agreement(
    request: Request,
    agreement_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import select as _select
    from app.models.agreement import AgreementVersion, UserAgreement
    import uuid as _uuid

    user_id = verify_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token.")

    version_result = await db.execute(
        _select(AgreementVersion).where(AgreementVersion.id == _uuid.UUID(agreement_id))
    )
    version = version_result.scalar_one_or_none()
    if not version:
        raise HTTPException(status_code=404, detail="Agreement version not found.")

    existing = await db.execute(
        _select(UserAgreement).where(
            UserAgreement.user_id == user_id,
            UserAgreement.agreement_version_id == version.id,
        )
    )
    if existing.scalar_one_or_none():
        return {"message": "Already accepted."}

    client_ip = request.headers.get("CF-Connecting-IP") or (
        request.client.host if request.client else None
    )
    db.add(UserAgreement(
        user_id=_uuid.UUID(user_id),
        agreement_version_id=version.id,
        accepted_ip=client_ip,
    ))
    await db.commit()
    return {"message": "Agreement accepted."}
