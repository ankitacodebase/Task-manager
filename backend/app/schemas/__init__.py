from app.schemas.common import ApiResponse, PaginatedResponse, PaginationMeta, ErrorResponse, create_error_response
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    SendOtpRequest,
    VerifyOtpRequest,
    AuthResponse,
    UserSummaryResponse,
    ForgotPasswordResponse,
    MessageResponse,
)
from app.schemas.user import CreateUserRequest, UserResponse
from app.schemas.task import (
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    TaskAssignRequest,
    TaskResponse,
)
