import logging
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import asyncmy

from app.core.enums import ErrorCode
from app.core.exceptions import AppException
from app.middleware.correlation import get_correlation_id
from app.schemas.common import create_error_response

logger = logging.getLogger("taskflow.error_handler")

def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        corr_id = getattr(request.state, "correlation_id", get_correlation_id())
        payload = create_error_response(
            code=exc.code,
            message=exc.message,
            correlation_id=corr_id,
            details=exc.details,
        )
        return JSONResponse(status_code=exc.status_code, content=payload)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        corr_id = getattr(request.state, "correlation_id", get_correlation_id())
        errors = {}
        for err in exc.errors():
            loc = ".".join(str(x) for x in err.get("loc", []))
            errors[loc] = err.get("msg")
        payload = create_error_response(
            code=ErrorCode.VALIDATION_ERROR,
            message="Request input validation failed.",
            correlation_id=corr_id,
            details={"validation_errors": errors},
        )
        return JSONResponse(status_code=422, content=payload)

    @app.exception_handler(asyncmy.errors.MySQLError)
    async def mysql_exception_handler(request: Request, exc: asyncmy.errors.MySQLError) -> JSONResponse:
        corr_id = getattr(request.state, "correlation_id", get_correlation_id())
        errno = getattr(exc, "args", [None])[0] if getattr(exc, "args", None) else None
        
        # 1062 = Duplicate key violation
        if errno == 1062:
            payload = create_error_response(
                code=ErrorCode.DUPLICATE_RESOURCE_ERROR,
                message="A resource with the specified unique field already exists.",
                correlation_id=corr_id,
            )
            return JSONResponse(status_code=409, content=payload)
        
        # 1452 = Foreign key constraint fails
        if errno == 1452:
            payload = create_error_response(
                code=ErrorCode.NON_MEMBER_ASSIGNMENT_ERROR,
                message="Referenced foreign resource does not exist.",
                correlation_id=corr_id,
            )
            return JSONResponse(status_code=400, content=payload)

        logger.exception("Database error occurred [correlation_id=%s]: %s", corr_id, str(exc))
        payload = create_error_response(
            code=ErrorCode.INTERNAL_SERVER_ERROR,
            message="A database processing error occurred.",
            correlation_id=corr_id,
        )
        return JSONResponse(status_code=500, content=payload)

    @app.exception_handler(Exception)
    async def global_unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        corr_id = getattr(request.state, "correlation_id", get_correlation_id())
        logger.exception("Unhandled server crash [correlation_id=%s]: %s", corr_id, str(exc))
        payload = create_error_response(
            code=ErrorCode.INTERNAL_SERVER_ERROR,
            message="An internal server error occurred. Please contact support with the correlation ID.",
            correlation_id=corr_id,
        )
        return JSONResponse(status_code=500, content=payload)
