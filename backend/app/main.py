from contextlib import asynccontextmanager
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.db import engine, Base, AsyncSessionLocal

# Models are registered with Base automatically when the routers/services
# import them, so no explicit model imports are needed here.
from app.api import auth, categories, creators, films
from app.services.category_service import seed_categories

UPLOAD_DIR = Path("uploads")

# Create upload directories immediately at import time so StaticFiles can mount them
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
(UPLOAD_DIR / "thumbnails").mkdir(exist_ok=True)
(UPLOAD_DIR / "videos").mkdir(exist_ok=True)
(UPLOAD_DIR / "avatars").mkdir(exist_ok=True)
(UPLOAD_DIR / "covers").mkdir(exist_ok=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Create all tables then seed default categories
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as db:
        await seed_categories(db)

    yield  # app runs here


app = FastAPI(
    title="Lumera API",
    description="Backend API for the Lumera streaming platform",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files as static assets
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(categories.router)
app.include_router(creators.router)
app.include_router(films.router)


@app.get("/")
async def root():
    return {"message": "Lumera API is running"}
