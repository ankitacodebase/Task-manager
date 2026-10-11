import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
import asyncmy
from asyncmy.cursors import DictCursor
from app.core.config import get_settings

logger = logging.getLogger("taskflow.database")

_pool: asyncmy.Pool | None = None

async def ensure_database_exists() -> None:
    """Connects to MySQL server and creates the database if it does not exist."""
    settings = get_settings()
    try:
        conn = await asyncmy.connect(
            host=settings.DATABASE_HOST,
            port=settings.DATABASE_PORT,
            user=settings.DATABASE_USER,
            password=settings.DATABASE_PASSWORD,
            autocommit=True,
            charset="utf8mb4",
        )
        async with conn.cursor() as cur:
            await cur.execute(
                f"CREATE DATABASE IF NOT EXISTS `{settings.DATABASE_NAME}` "
                "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
            )
        await conn.ensure_closed()
        logger.info("Database '%s' verified / created successfully on MySQL.", settings.DATABASE_NAME)
    except Exception as e:
        logger.warning("Could not auto-create database (might already exist or permission limited): %s", e)

async def init_db_pool() -> asyncmy.Pool:
    global _pool
    if _pool is not None:
        return _pool
    
    settings = get_settings()
    # 1. Ensure database exists
    await ensure_database_exists()

    logger.info("Initializing asyncmy MySQL pool on %s:%d/%s", settings.DATABASE_HOST, settings.DATABASE_PORT, settings.DATABASE_NAME)
    
    _pool = await asyncmy.create_pool(
        host=settings.DATABASE_HOST,
        port=settings.DATABASE_PORT,
        user=settings.DATABASE_USER,
        password=settings.DATABASE_PASSWORD,
        db=settings.DATABASE_NAME,
        minsize=settings.DATABASE_POOL_MIN,
        maxsize=settings.DATABASE_POOL_MAX,
        autocommit=False,
        cursor_cls=DictCursor,
        charset="utf8mb4",
    )
    return _pool

async def init_db_schema() -> None:
    """Auto-detects and executes init_db.sql statements if tables do not exist."""
    sql_file_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "init_db.sql"))
    if not os.path.exists(sql_file_path):
        logger.warning("init_db.sql not found at %s. Skipping auto-schema init.", sql_file_path)
        return

    logger.info("Auto-detecting and verifying MySQL tables from %s...", sql_file_path)
    with open(sql_file_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    statements = []
    current_stmt = []
    for line in sql_content.splitlines():
        trimmed = line.strip()
        if not trimmed or trimmed.startswith("--"):
            continue
        current_stmt.append(line)
        if trimmed.endswith(";"):
            stmt_text = "\n".join(current_stmt).strip()
            upper_stmt = stmt_text.upper()
            if not upper_stmt.startswith("CREATE DATABASE") and not upper_stmt.startswith("USE "):
                statements.append(stmt_text)
            current_stmt = []

    pool = get_pool()
    async with pool.acquire() as conn:
        async with conn.cursor() as cur:
            for stmt in statements:
                try:
                    await cur.execute(stmt)
                except Exception as e:
                    logger.debug("Notice on table verification: %s", e)
        await conn.commit()
    logger.info("Automatic database schema verification complete: all 16 tables ready.")

async def close_db_pool() -> None:
    global _pool
    if _pool is not None:
        logger.info("Closing asyncmy MySQL connection pool...")
        _pool.close()
        await _pool.wait_closed()
        _pool = None

def get_pool() -> asyncmy.Pool:
    if _pool is None:
        raise RuntimeError("Database connection pool is not initialized. Call init_db_pool() first.")
    return _pool

@asynccontextmanager
async def get_db_connection() -> AsyncGenerator[asyncmy.Connection, None]:
    pool = get_pool()
    async with pool.acquire() as connection:
        yield connection

@asynccontextmanager
async def transaction() -> AsyncGenerator[asyncmy.Connection, None]:
    pool = get_pool()
    async with pool.acquire() as connection:
        await connection.begin()
        try:
            yield connection
            await connection.commit()
        except Exception:
            await connection.rollback()
            raise
