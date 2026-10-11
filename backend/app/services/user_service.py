import uuid
import asyncmy
from app.core.enums import SystemRole, ErrorCode
from app.core.exceptions import AppException
from app.core.security import hash_password
from app.core.email import EmailService
from app.repositories.user_repository import UserRepository
from app.schemas.user import CreateUserRequest, UserResponse

class UserService:
    """Service layer executing business rules and validation for user management."""

    @staticmethod
    async def list_users(conn: asyncmy.Connection, tenant_id: str) -> list[UserResponse]:
        users = await UserRepository.list_by_tenant(conn, tenant_id)
        return [
            UserResponse(
                id=u["id"],
                tenant_id=u["tenant_id"],
                full_name=u["full_name"],
                email=u["email"],
                role=SystemRole(u["role"]),
                is_active=bool(u["is_active"]),
                created_at=u.get("created_at"),
            )
            for u in users
        ]

    @staticmethod
    async def create_user(
        conn: asyncmy.Connection,
        tenant_id: str,
        req: CreateUserRequest
    ) -> UserResponse:
        existing = await UserRepository.get_by_email_in_tenant(conn, tenant_id, req.email)
        if existing:
            raise AppException(
                status_code=409,
                error_code=ErrorCode.VALIDATION_ERROR,
                message=f"User with email '{req.email}' already exists.",
            )

        new_user_id = str(uuid.uuid4())
        hashed_pw = hash_password(req.password)

        await UserRepository.create_user(
            conn=conn,
            user_id=new_user_id,
            tenant_id=tenant_id,
            email=req.email,
            password_hash=hashed_pw,
            full_name=req.full_name,
            role=req.role.value,
        )
        await conn.commit()

        # Send welcome onboarding email with credentials
        await EmailService.send_welcome_user(
            to_email=req.email,
            full_name=req.full_name,
            temporary_password=req.password,
            role=req.role.value,
        )

        return UserResponse(
            id=new_user_id,
            tenant_id=tenant_id,
            full_name=req.full_name,
            email=req.email,
            role=req.role,
            is_active=True,
        )
