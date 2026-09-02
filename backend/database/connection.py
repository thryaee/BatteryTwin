"""
database/connection.py
----------------------
SQLAlchemy engine + session factory.
"""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from config import settings
from utils.logger import get_logger

logger = get_logger(__name__)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


# Create engine with connection pool settings suitable for a local dev server
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,          # test connections before using them
    pool_size=5,
    max_overflow=10,
    echo=(settings.app_env == "development"),
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)


def get_db():
    """
    FastAPI dependency – yields a DB session and ensures it is closed
    after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in models.py (called on startup)."""
    # Import models here to ensure they are registered on Base.metadata
    from database import models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created / verified.")
