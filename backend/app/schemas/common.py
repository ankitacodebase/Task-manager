from datetime import datetime, timezone
from typing import Any, Generic, TypeVar
from pydantic import BaseModel, Field
from app.core.enums import ErrorCode

T = TypeVar("T")

class PaginationMeta(BaseModel):
    next_cursor: str | None = None
    limit: int = 50

class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    data: T
    meta: PaginationMeta | dict[str, Any] | None = None
    message: str | None = None

class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = True
    items: list[T]
    meta: PaginationMeta
    message: str | None = None

class ErrorDetail(BaseModel):
    code: ErrorCode
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    correlation_id: str
    timestamp: str

class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail

def create_error_response(
    code: ErrorCode,
    message: str,
    correlation_id: str,
    details: dict[str, Any] | None = None,
) -> dict[str, Any]:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or {},
            "correlation_id": correlation_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    }
