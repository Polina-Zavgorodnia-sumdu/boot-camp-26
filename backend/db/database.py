"""
database.py — Підключення до SQLite через SQLAlchemy (async)
Щоб перейти на PostgreSQL — змінити DATABASE_URL на:
  postgresql+asyncpg://user:password@localhost/ukrdata
"""

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
import os

# Шлях до файлу БД — поруч з папкою backend/
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_URL = f"sqlite+aiosqlite:///{BASE_DIR}/ukrdata.db"

engine = create_async_engine(
    DATABASE_URL,
    echo=False,          # True — виводить SQL у консоль (для дебагу)
    connect_args={"check_same_thread": False},
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    """Dependency для FastAPI — дає сесію і закриває після запиту."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Створює всі таблиці якщо їх ще немає."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
