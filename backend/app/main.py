from contextlib import asynccontextmanager
import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from app.core.limiter import limiter

from app.database.db import engine, Base, AsyncSessionLocal
from app.api import auth, categories, creators, films, admin
from app.models.film_report import FilmReport       # noqa: F401 — ensures table is created
from app.models.film_like import FilmLike           # noqa: F401
from app.models.user_report import UserReport       # noqa: F401
from app.services.category_service import seed_categories

UPLOAD_DIR = Path("uploads")

# Create upload directories at import time so StaticFiles can mount them
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "thumbnails").mkdir(exist_ok=True)
(UPLOAD_DIR / "videos").mkdir(exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(exist_ok=True)
(UPLOAD_DIR / "covers").mkdir(exist_ok=True)



@asynccontextmanager
async def lifespan(_app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await seed_categories(db)
    yield


_is_production = os.getenv("ENVIRONMENT", "development").lower() == "production"

app = FastAPI(
    title="Lumera API",
    description="Backend API for the Lumera streaming platform",
    version="0.3.0",
    lifespan=lifespan,
    # Disable interactive docs in production — API schema should not be public
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
    openapi_url=None if _is_production else "/openapi.json",
)

# Attach rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Serve uploaded files as static assets (local dev fallback only — production uses Cloudflare R2)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(creators.router)
app.include_router(films.router)
app.include_router(admin.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "Lumera API is running"}
