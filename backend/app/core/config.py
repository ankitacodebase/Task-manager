from pathlib import Path
from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=(_ENV_PATH, ".env"), env_file_encoding="utf-8", extra="ignore")

    # Application
    APP_NAME: str
    ENVIRONMENT: str
    DEBUG: bool

    # Database (MySQL 8.4 LTS via asyncmy)
    DATABASE_HOST: str
    DATABASE_PORT: int
    DATABASE_USER: str
    DATABASE_PASSWORD: str
    DATABASE_NAME: str
    DATABASE_POOL_MIN: int
    DATABASE_POOL_MAX: int

    # Cryptography & Security
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int
    JWT_PRE_AUTH_EXPIRE_MINUTES: int
    RESET_TOKEN_EXPIRE_MINUTES: int

    # Storage
    UPLOAD_DIR: str
    MAX_UPLOAD_BYTES: int

    # CORS
    CORS_ORIGINS: list[str]

    # SMTP Email
    SMTP_HOST: str
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    EMAIL_FROM: str

    # Predefined Super Admin Bootstrap (Strictly loaded from .env)
    SUPER_ADMIN_TENANT_NAME: str
    SUPER_ADMIN_FULL_NAME: str
    SUPER_ADMIN_EMAIL: str
    SUPER_ADMIN_PASSWORD: str

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_key_length(cls, v: str) -> str:
        if len(v.encode("utf-8")) < 64:
            raise ValueError("JWT_SECRET_KEY must be at least 64 bytes for HS512 security.")
        return v

@lru_cache
def get_settings() -> Settings:
    return Settings()
