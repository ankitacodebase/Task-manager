from typing import Any, AsyncGenerator, Annotated
from fastapi import Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import asyncmy

from app.core.enums import SystemRole, ErrorCode
from app.core.exceptions import AppException
from app.core.security import decode_token
from app.core.database import get_db_connection
from app.repositories.auth_repository import AuthRepository

# HTTP Bearer security scheme for Swagger UI
security_scheme = HTTPBearer(auto_error=False)

async def get_db() -> AsyncGenerator[asyncmy.Connection, None]:
    """Dependency yielding a connection from the asyncmy MySQL connection pool."""
    async with get_db_connection() as conn:
        yield conn

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    authorization: str | None = Header(None, description="Bearer JWT token"),
    conn: asyncmy.Connection = Depends(get_db),
) -> dict[str, Any]:
    """
    Validates HS512 JWT access token and returns authenticated user entity.
    Supports HttpOnly secure cookie, Swagger HTTPBearer, and Authorization header.
    Strictly enforces Invariant #21: PRE_AUTH tokens are rejected immediately with 401.
    """
    token: str | None = None
    # 1. Explicit Authorization header takes precedence (for Swagger UI, mobile, tests)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
    elif credentials:
        token = credentials.credentials
    # 2. HttpOnly secure cookie for web browser sessions
    elif "access_token" in request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="Missing or invalid authentication token. Please sign in.",
        )

    payload = decode_token(token)

    # Invariant #21: Reject PRE_AUTH tokens immediately
    if payload.get("role") == SystemRole.PRE_AUTH.value:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="PRE_AUTH token cannot access protected endpoints. Complete 2FA verification first.",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="Token payload is missing subject claim.",
        )

    user = await AuthRepository.get_user_by_id(conn, user_id)
    if not user:
        raise AppException(
            status_code=401,
            error_code=ErrorCode.AUTHENTICATION_ERROR,
            message="User associated with token no longer exists.",
        )

    if not user.get("is_active"):
        raise AppException(
            status_code=403,
            error_code=ErrorCode.AUTHORIZATION_ERROR,
            message="User account is deactivated.",
        )

    return user

async def require_admin(
    current_user: dict[str, Any] = Depends(get_current_user),
) -> dict[str, Any]:
    """Ensures authenticated user possesses ADMIN or SUPER_ADMIN privileges."""
    if current_user["role"] not in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value):
        raise AppException(
            status_code=403,
            error_code=ErrorCode.AUTHORIZATION_ERROR,
            message="Administrative privileges required to access this resource.",
        )
    return current_user

# Modern FastAPI Annotated Type Aliases for Clean Route Injections
DbDep = Annotated[asyncmy.Connection, Depends(get_db)]
CurrentUser = Annotated[dict[str, Any], Depends(get_current_user)]
AdminUser = Annotated[dict[str, Any], Depends(require_admin)]
