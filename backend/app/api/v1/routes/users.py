from fastapi import APIRouter
from app.schemas.common import ApiResponse
from app.api.deps import DbDep, CurrentUser, AdminUser
from app.services.user_service import UserService
from app.schemas.user import CreateUserRequest, UserResponse

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=ApiResponse[list[UserResponse]])
async def list_users(current_user: CurrentUser, conn: DbDep) -> ApiResponse[list[UserResponse]]:
    """List team members in current tenant organization."""
    users = await UserService.list_users(conn, current_user["tenant_id"])
    return ApiResponse(data=users, message="Tenant users retrieved successfully.")

@router.post("", response_model=ApiResponse[UserResponse], status_code=201)
async def create_user(
    req: CreateUserRequest,
    current_admin: AdminUser,
    conn: DbDep,
) -> ApiResponse[UserResponse]:
    """Provision a new team member and dispatch welcome email (Admin only)."""
    new_user = await UserService.create_user(conn, current_admin["tenant_id"], req)
    return ApiResponse(data=new_user, message="Team member created successfully.")
