from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import engine, Base
from app.api import auth

# Creates the FastAPI app instance
app = FastAPI(
    title="Lumera API",
    description="Backend API for the Lumera streaming platform",
    version="0.1.0"
)

# Browsers block requests from one domain to another by default.
# This tells FastAPI to allow requests coming from the React frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's dev server URL
    allow_credentials=True,
    allow_methods=["*"],   # allow GET, POST, PUT, DELETE etc.
    allow_headers=["*"],   # allow all headers
)

# Register the auth router
app.include_router(auth.router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Health check route
@app.get("/")
async def root():
    return {"message": "Lumera API is running"}
