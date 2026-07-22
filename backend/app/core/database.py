"""Database configuration - with auto-migration."""

import logging
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
from sqlalchemy.orm import DeclarativeBase
from .config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
)

async_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Create tables + auto-migrate missing columns."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            
            # 🔥 Auto-migrate: add missing columns
            for table, col, dtype in [
                ("chat_history", "session_id", "VARCHAR(100) DEFAULT 'default'"),
            ]:
                try:
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {dtype}"))
                    logger.info(f"✅ Added column {col} to {table}")
                except Exception as ex:
                    if "already exists" not in str(ex).lower() and "duplicate" not in str(ex).lower() and "already there" not in str(ex).lower():
                        logger.warning(f"Column {col} maybe exists: {ex}")
            
            await conn.commit()
        
        logger.info("✅ Database ready!")
    except Exception as e:
        logger.warning(f"⚠️ DB init issue: {e}")
