import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Any, Optional
import bcrypt
import jwt
from app.core.config import get_settings
from app.core.enums import SystemRole, ErrorCode
from app.core.exceptions import AppException

settings = get_settings()

def hash_password(password: str) -> str:
    """Hashes a plain text password using Bcrypt with cost factor 12."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain text password against a stored Bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(
    user_id: str,
    tenant_id: str,
    role: str,
    expires_delta: Optional[timedelta] = None
) -> str:
    """Creates a signed HS512 JWT access token."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)
    
    payload = {
        "sub": user_id,
        "tid": tenant_id,
        "role": role,
        "iss": "taskflow",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": secrets.token_hex(16),
        "token_type": "access",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def create_pre_auth_token(
    user_id: str,
    tenant_id: str
) -> str:
    """Creates a short-lived (5 min) HS512 JWT for 2FA verification with PRE_AUTH role."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(minutes=settings.JWT_PRE_AUTH_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "tid": tenant_id,
        "role": SystemRole.PRE_AUTH.value,
        "iss": "taskflow",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": secrets.token_hex(16),
        "token_type": "pre_auth",
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_token(token: str) -> dict[str, Any]:
    """Decodes and validates an HS512 JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            issuer="taskflow",
            options={"require": ["sub", "tid", "role", "exp", "iss"]}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="Token has expired. Please authenticate again.",
        )
    except jwt.InvalidTokenError as e:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message=f"Invalid authentication token: {str(e)}",
        )

def generate_random_token(length: int = 32) -> str:
    """Generates a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(length)

def hash_token(token: str) -> str:
    """Hashes a raw token with SHA-256 for secure storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
