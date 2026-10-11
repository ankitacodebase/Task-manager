from typing import Any
from app.core.enums import ErrorCode

class AppException(Exception):
    def __init__(
        self,
        code: ErrorCode | None = None,
        message: str = "Application error",
        status_code: int = 400,
        details: dict[str, Any] | None = None,
        error_code: ErrorCode | None = None,
    ):
        super().__init__(message)
        self.code = code or error_code or ErrorCode.INTERNAL_SERVER_ERROR
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class BadRequestError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.VALIDATION_ERROR, message: str = "Bad Request", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=400, details=details)

class UnauthorizedError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.INVALID_CREDENTIALS, message: str = "Unauthorized", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=401, details=details)

class ForbiddenError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.INSUFFICIENT_PROJECT_ROLE, message: str = "Forbidden", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=403, details=details)

class NotFoundError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.RESOURCE_NOT_FOUND, message: str = "Resource not found", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=404, details=details)

class ConflictError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.CONCURRENT_MODIFICATION_ERROR, message: str = "Conflict", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=409, details=details)

class ValidationError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.VALIDATION_ERROR, message: str = "Validation failed", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=422, details=details)

class RateLimitExceededError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.RATE_LIMIT_EXCEEDED, message: str = "Rate limit exceeded. Please try again later.", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=429, details=details)

class InternalServerError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR, message: str = "An unexpected error occurred.", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=500, details=details)

class ServiceUnavailableError(AppException):
    def __init__(self, code: ErrorCode = ErrorCode.DATABASE_UNAVAILABLE, message: str = "Service unavailable.", details: dict[str, Any] | None = None):
        super().__init__(code=code, message=message, status_code=503, details=details)
