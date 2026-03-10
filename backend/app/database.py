"""
database.py – SQLAlchemy engine & session factory
Reads connection settings exclusively from the .env file.
Auto-creates the MySQL database if it does not exist yet.
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase

load_dotenv()

DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:password@localhost:3306/course_management",
)

# ── Auto-create the database if it doesn't exist ─────────────────────────────
def _ensure_database_exists(url: str) -> None:
    """
    Connect to MySQL without selecting a database, then run
    CREATE DATABASE IF NOT EXISTS <db_name>.
    Works by stripping the database name from the URL.
    """
    # Split off the database name: everything after the last '/'
    # e.g. mysql+pymysql://user:pass@host:port/dbname  -> dbname
    base_url, db_name = url.rsplit("/", 1)
    # Remove any query-string from db_name (e.g. ?charset=utf8)
    db_name = db_name.split("?")[0]
    temp_engine = create_engine(base_url + "/", echo=False)
    with temp_engine.connect() as conn:
        conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}`"))
    temp_engine.dispose()

_ensure_database_exists(DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,      # reconnect on stale connections
    pool_size=10,
    max_overflow=20,
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ------- Dependency injection helper ----------------------------------------
def get_db():
    """FastAPI dependency that yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
