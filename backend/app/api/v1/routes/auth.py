from fastapi import APIRouter, Response
from app.core.enums import SystemRole
from app.schemas.common import ApiResponse
from app.api.deps import DbDep, CurrentUser
from app.services.auth_service import AuthService
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

router = APIRouter(prefix="/auth", tags=["Auth"])

def _set_auth_cookie(response: Response, token: str) -> None:
    """Sets secure HttpOnly cookie for browser sessions (immune to XSS)."""
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        samesite="lax",
        max_age=86400 * 7,  # 7 days
        path="/",
    )

@router.post("/register", response_model=ApiResponse[AuthResponse], status_code=201)
async def register(req: RegisterRequest) -> ApiResponse[AuthResponse]:
    """Register organization tenant and administrator, dispatches verification OTP email."""
    auth_data = await AuthService.register(req)
    return ApiResponse(data=auth_data, message="Organization registered. Verification code dispatched to email.")

@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(req: LoginRequest, conn: DbDep, response: Response) -> ApiResponse[AuthResponse]:
    """Authenticate user credentials, issue HS512 JWT and set HttpOnly cookie."""
    auth_data = await AuthService.login(conn, req)
    _set_auth_cookie(response, auth_data.access_token)
    return ApiResponse(data=auth_data, message="Authenticated successfully.")

@router.post("/logout", response_model=ApiResponse[MessageResponse])
async def logout(response: Response) -> ApiResponse[MessageResponse]:
    """Clears the HttpOnly access_token cookie."""
    response.delete_cookie(key="access_token", path="/")
    return ApiResponse(
        data=MessageResponse(message="Successfully logged out and session cleared."),
        message="Logged out successfully.",
    )

@router.post("/forgot-password", response_model=ApiResponse[ForgotPasswordResponse])
async def forgot_password(req: ForgotPasswordRequest, conn: DbDep) -> ApiResponse[ForgotPasswordResponse]:
    """Request password recovery token and dispatch email."""
    res = await AuthService.forgot_password(conn, req)
    return ApiResponse(data=res, message="Password reset request processed.")

@router.post("/reset-password", response_model=ApiResponse[MessageResponse])
async def reset_password(req: ResetPasswordRequest, conn: DbDep) -> ApiResponse[MessageResponse]:
    """Reset password using verified recovery token."""
    res = await AuthService.reset_password(conn, req)
    return ApiResponse(data=res, message="Password updated successfully.")

@router.post("/otp/send", response_model=ApiResponse[MessageResponse])
async def send_otp(req: SendOtpRequest, conn: DbDep) -> ApiResponse[MessageResponse]:
    """Generate and dispatch 6-digit numeric OTP via async email."""
    res = await AuthService.send_otp(conn, req)
    return ApiResponse(data=res, message="Verification code dispatched.")

@router.post("/otp/verify", response_model=ApiResponse[AuthResponse])
async def verify_otp(req: VerifyOtpRequest, conn: DbDep, response: Response) -> ApiResponse[AuthResponse]:
    """Verify 6-digit numeric OTP, exchange for HS512 JWT and set HttpOnly cookie."""
    auth_data = await AuthService.verify_otp(conn, req)
    _set_auth_cookie(response, auth_data.access_token)
    return ApiResponse(data=auth_data, message="Verification successful.")

@router.get("/me", response_model=ApiResponse[UserSummaryResponse])
async def get_me(current_user: CurrentUser) -> ApiResponse[UserSummaryResponse]:
    """Retrieve active authenticated profile details via HttpOnly cookie or Bearer token."""
    summary = UserSummaryResponse(
        id=current_user["id"],
        tenant_id=current_user["tenant_id"],
        tenant_name=current_user.get("tenant_name"),
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=SystemRole(current_user["role"]),
        is_active=bool(current_user["is_active"]),
    )
    return ApiResponse(data=summary, message="User profile retrieved.")
