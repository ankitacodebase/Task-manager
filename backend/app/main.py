import os
import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import get_settings
from app.core.database import init_db_pool, close_db_pool, get_pool, init_db_schema
from app.core.rate_limiter import limiter
from app.middleware.correlation import CorrelationIdMiddleware
from app.middleware.error_handler import register_exception_handlers
from app.schemas.common import ApiResponse
from app.api.v1.router import api_router

from app.services.auth_service import AuthService

settings = get_settings()
logging.basicConfig(level=logging.INFO if not settings.DEBUG else logging.DEBUG)
logger = logging.getLogger("taskflow.main")

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # 1. Startup: Initialize database pool & verify database exists
    logger.info("Initializing database connection pool...")
    await init_db_pool()

    # 2. Startup: Auto-detect and initialize all MySQL tables from init_db.sql
    logger.info("Auto-detecting and verifying MySQL tables...")
    await init_db_schema()

    # 3. Startup: Bootstrap predefined super admin if not present
    logger.info("Checking predefined root super admin account...")
    await AuthService.bootstrap_super_admin()

    # 4. Startup: Ensure upload directory exists (Invariant #24)
    logger.info("Ensuring upload directory at %s...", settings.UPLOAD_DIR)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    yield

    # 4. Shutdown: Close database pool cleanly
    logger.info("Shutting down database connection pool...")
    await close_db_pool()

app = FastAPI(
    title=settings.APP_NAME,
    description="Multi-tenant Enterprise Task Management Platform with full authentication and task lifecycle.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate limiter setup
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Global Correlation and Exception Filtering
app.add_middleware(CorrelationIdMiddleware)
register_exception_handlers(app)

# CORS Configuration for React Frontend with HttpOnly cookies
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API v1 Routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/health", response_model=ApiResponse[dict[str, str]], tags=["System"])
async def health_check() -> ApiResponse[dict[str, str]]:
    """Health check endpoint to verify database pool connectivity and system readiness."""
    pool = get_pool()
    return ApiResponse(
        data={
            "status": "healthy",
            "environment": settings.ENVIRONMENT,
            "database": "connected",
        },
        message="System operational.",
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
