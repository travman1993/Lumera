import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase

# Load variables from env
DATABASE_URL = os.getenv("DATABASE_URL")

# Create Async Engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Session Convo, control saves, keep data accesible
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    expire_on_commit=False
)

# Base Class
class Base(DeclarativeBase):
    pass

# Each route its own database session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session