import uuid
from datetime import datetime, timedelta
import asyncmy
from app.core.config import get_settings
from app.core.enums import SystemRole, ErrorCode
from app.core.exceptions import AppException
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_random_token,
    hash_token,
)
from app.core.database import transaction, get_db_connection
from app.repositories.auth_repository import AuthRepository
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
from app.core.email import EmailService

settings = get_settings()

class AuthService:
    """Service layer executing business rules and security checks for authentication."""

    @staticmethod
    async def register(req: RegisterRequest) -> AuthResponse:
        import secrets
        otp_code = f"{secrets.randbelow(1_000_000):06d}"
        otp_hash = hash_token(otp_code)
        expires_at = datetime.now() + timedelta(minutes=10)
        hashed_pw = hash_password(req.password)

        # Check duplicate email
        async with get_db_connection() as conn:
            existing = await AuthRepository.get_user_by_email(conn, req.email)

        if existing:
            # If user already completed OTP verification, reject with 409 Conflict
            if existing.get("is_verified"):
                raise AppException(
                    status_code=409,
                    error_code=ErrorCode.VALIDATION_ERROR,
                    message=f"User with email '{req.email}' already exists. Please sign in instead.",
                )

            # Approach A: Unverified registration detected! Re-issue fresh OTP and update details
            user_id = existing["id"]
            tenant_id = existing["tenant_id"]

            async with transaction() as conn:
                await AuthRepository.update_unverified_user(
                    conn, user_id=user_id, password_hash=hashed_pw, full_name=req.full_name
                )
                await AuthRepository.update_tenant_name(conn, tenant_id=tenant_id, name=req.tenant_name)
                await AuthRepository.set_email_otp(conn, user_id, otp_hash, expires_at)

            # Re-dispatch registration verification email notification with fresh 6-digit OTP code
            await EmailService.send_otp(
                to_email=req.email.lower(),
                otp_code=otp_code,
                purpose="Registration Email Verification (Re-issued)",
            )

            token = create_access_token(
                user_id=user_id,
                tenant_id=tenant_id,
                role=SystemRole.ADMIN.value,
            )

            user_summary = UserSummaryResponse(
                id=user_id,
                tenant_id=tenant_id,
                tenant_name=req.tenant_name,
                email=req.email.lower(),
                full_name=req.full_name,
                role=SystemRole.ADMIN,
                is_active=True,
                is_verified=False,
            )

            return AuthResponse(access_token=token, user=user_summary)

        # Brand new registration:
        tenant_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())

        async with transaction() as conn:
            # 1. Create Tenant Organization
            await AuthRepository.create_tenant(conn, tenant_id, req.tenant_name)
            
            # 2. Create Admin User
            await AuthRepository.create_user(
                conn,
                user_id=user_id,
                tenant_id=tenant_id,
                email=req.email.lower(),
                password_hash=hashed_pw,
                full_name=req.full_name,
                role=SystemRole.ADMIN.value,
            )
            
            # 3. Notification Preferences (Invariant #22: user_id PK)
            await AuthRepository.create_notification_preferences(conn, user_id)

            # 4. Create primary workspace project
            await AuthRepository.create_default_project(
                conn,
                project_id=project_id,
                tenant_id=tenant_id,
                name="Main Workspace",
                project_key="TASK",
                created_by=user_id,
            )

            # 5. Set registration email OTP
            await AuthRepository.set_email_otp(conn, user_id, otp_hash, expires_at)

        # Dispatch registration verification email notification with 6-digit OTP code
        await EmailService.send_otp(
            to_email=req.email.lower(),
            otp_code=otp_code,
            purpose="Registration Email Verification",
        )

        token = create_access_token(
            user_id=user_id,
            tenant_id=tenant_id,
            role=SystemRole.ADMIN.value,
        )

        user_summary = UserSummaryResponse(
            id=user_id,
            tenant_id=tenant_id,
            tenant_name=req.tenant_name,
            email=req.email.lower(),
            full_name=req.full_name,
            role=SystemRole.ADMIN,
            is_active=True,
            is_verified=False,
        )

        return AuthResponse(access_token=token, user=user_summary)

    @staticmethod
    async def login(conn: asyncmy.Connection, req: LoginRequest) -> AuthResponse:
        user = await AuthRepository.get_user_by_email(conn, req.email)
        if not user:
            raise AppException(
                status_code=401,
                error_code=ErrorCode.AUTHENTICATION_ERROR,
                message="Invalid email or password.",
            )

        # 5-failed attempts lockout check
        now = datetime.now()
        if user.get("lockout_until") and user["lockout_until"] > now:
            minutes_left = int((user["lockout_until"] - now).total_seconds() / 60) + 1
            raise AppException(
                status_code=403,
                error_code=ErrorCode.AUTHORIZATION_ERROR,
                message=f"Account temporarily locked due to failed attempts. Try again in {minutes_left} minutes.",
            )

        # Deactivated check
        if not user.get("is_active"):
            raise AppException(
                status_code=403,
                error_code=ErrorCode.AUTHORIZATION_ERROR,
                message="Account has been deactivated. Please contact administrator.",
            )

        # Unverified check
        if not user.get("is_verified"):
            raise AppException(
                status_code=403,
                error_code=ErrorCode.AUTHORIZATION_ERROR,
                message="Account email is not verified yet. Please complete OTP verification or register again to receive a fresh verification code.",
            )

        # Bcrypt check
        if not verify_password(req.password, user["password_hash"]):
            failed_attempts = (user.get("failed_login_attempts") or 0) + 1
            lockout_until = None
            if failed_attempts >= 5:
                lockout_until = now + timedelta(minutes=15)
            await AuthRepository.update_failed_attempts(conn, user["id"], failed_attempts, lockout_until)
            await conn.commit()

            if lockout_until:
                raise AppException(
                    status_code=403,
                    error_code=ErrorCode.AUTHORIZATION_ERROR,
                    message="Account locked for 15 minutes due to 5 consecutive failed attempts.",
                )
            raise AppException(
                status_code=401,
                error_code=ErrorCode.AUTHENTICATION_ERROR,
                message="Invalid email or password.",
            )

        # Reset failed attempts upon successful login
        if user.get("failed_login_attempts", 0) > 0 or user.get("lockout_until"):
            await AuthRepository.reset_failed_attempts(conn, user["id"])
            await conn.commit()

        token = create_access_token(
            user_id=user["id"],
            tenant_id=user["tenant_id"],
            role=user["role"],
        )

        user_summary = UserSummaryResponse(
            id=user["id"],
            tenant_id=user["tenant_id"],
            tenant_name=user.get("tenant_name"),
            email=user["email"],
            full_name=user["full_name"],
            role=SystemRole(user["role"]),
            is_active=bool(user["is_active"]),
            is_verified=True,
        )

        return AuthResponse(access_token=token, user=user_summary)

    @staticmethod
    async def forgot_password(conn: asyncmy.Connection, req: ForgotPasswordRequest) -> ForgotPasswordResponse:
        user = await AuthRepository.get_user_by_email(conn, req.email)
        if not user:
            return ForgotPasswordResponse(
                message="If the email exists, password recovery instructions have been initiated."
            )

        raw_token = generate_random_token(32)
        token_hash = hash_token(raw_token)
        expires_at = datetime.now() + timedelta(minutes=settings.RESET_TOKEN_EXPIRE_MINUTES)

        await AuthRepository.set_reset_token(conn, user["id"], token_hash, expires_at)
        await conn.commit()

        # Dispatch branded password reset email
        await EmailService.send_password_reset(
            to_email=user["email"],
            reset_token=raw_token,
            expires_minutes=settings.RESET_TOKEN_EXPIRE_MINUTES,
        )

        return ForgotPasswordResponse(
            message="Password reset instructions and token have been sent to your email.",
            reset_token=raw_token,
        )

    @staticmethod
    async def reset_password(conn: asyncmy.Connection, req: ResetPasswordRequest) -> MessageResponse:
        token_hash = hash_token(req.token)
        user = await AuthRepository.get_user_by_reset_token(conn, token_hash)
        if not user:
            raise AppException(
                status_code=400,
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Invalid or expired recovery token.",
            )

        expires_at = user.get("reset_token_expires_at")
        if not expires_at or expires_at < datetime.now():
            raise AppException(
                status_code=400,
                error_code=ErrorCode.VALIDATION_ERROR,
                message="Recovery token has expired. Please request a new one.",
            )

        hashed_pw = hash_password(req.new_password)
        await AuthRepository.update_password(conn, user["id"], hashed_pw)
        await conn.commit()

        return MessageResponse(message="Password reset successfully. You can now log in.")

    @staticmethod
    async def send_otp(conn: asyncmy.Connection, req: SendOtpRequest) -> MessageResponse:
        """Generates a 6-digit numeric OTP, hashes it, saves to DB, and sends via EmailService."""
        user = await AuthRepository.get_user_by_email(conn, req.email)
        if not user:
            # Prevent email enumeration: return generic confirmation
            return MessageResponse(message="If the email exists, a verification code has been dispatched.")

        # Generate 6-digit numeric OTP
        import secrets
        otp_code = f"{secrets.randbelow(1_000_000):06d}"
        otp_hash = hash_token(otp_code)
        expires_at = datetime.now() + timedelta(minutes=10)

        await AuthRepository.set_email_otp(conn, user["id"], otp_hash, expires_at)
        await conn.commit()

        # Dispatch via async email service
        await EmailService.send_otp(user["email"], otp_code, purpose="Login / Two-Factor Authentication")

        return MessageResponse(message="A 6-digit verification code has been sent to your email address.")

    @staticmethod
    async def verify_otp(conn: asyncmy.Connection, req: VerifyOtpRequest) -> AuthResponse:
        """Validates 6-digit numeric OTP, clears OTP, and issues HS512 JWT access token."""
        user = await AuthRepository.get_user_by_email(conn, req.email)
        if not user:
            raise AppException(
                status_code=401,
                error_code=ErrorCode.INVALID_CREDENTIALS,
                message="Invalid verification attempt.",
            )

        # Check expiration
        expires_at = user.get("email_otp_expires_at")
        if not expires_at or expires_at < datetime.now():
            raise AppException(
                status_code=400,
                error_code=ErrorCode.OTP_EXPIRED,
                message="Verification code has expired. Please request a new code.",
            )

        # Verify hash match
        candidate_hash = hash_token(req.otp_code)
        if candidate_hash != user.get("email_otp_hash"):
            raise AppException(
                status_code=401,
                error_code=ErrorCode.INVALID_OTP,
                message="Invalid verification code entered.",
            )

        # Mark user as verified and clear OTP
        await AuthRepository.mark_user_verified(conn, user["id"])
        await conn.commit()

        token = create_access_token(
            user_id=user["id"],
            tenant_id=user["tenant_id"],
            role=user["role"],
        )

        user_summary = UserSummaryResponse(
            id=user["id"],
            tenant_id=user["tenant_id"],
            tenant_name=user.get("tenant_name"),
            email=user["email"],
            full_name=user["full_name"],
            role=SystemRole(user["role"]),
            is_active=bool(user["is_active"]),
            is_verified=True,
        )

        return AuthResponse(access_token=token, user=user_summary)

    @staticmethod
    async def bootstrap_super_admin() -> None:
        """
        Predefined Root Super Admin Bootstrap:
        - Reads SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, etc. from settings/.env.
        - Checks if this SUPER_ADMIN user already exists. If yes, skips creation gracefully.
        - If not, initializes root tenant organization, super admin account with role=SUPER_ADMIN,
          notification preferences, and default workspace project.
        """
        import logging
        logger = logging.getLogger("taskflow.bootstrap")

        super_admin_email = settings.SUPER_ADMIN_EMAIL
        if not super_admin_email:
            return

        async with get_db_connection() as conn:
            existing = await AuthRepository.get_user_by_email(conn, super_admin_email.lower())
            if existing:
                logger.info("Predefined Super Admin '%s' already exists. Skipping bootstrap.", super_admin_email)
                return

        tenant_name = settings.SUPER_ADMIN_TENANT_NAME
        full_name = settings.SUPER_ADMIN_FULL_NAME
        password = settings.SUPER_ADMIN_PASSWORD

        tenant_id = str(uuid.uuid4())
        user_id = str(uuid.uuid4())
        project_id = str(uuid.uuid4())
        hashed_pw = hash_password(password)

        async with transaction() as conn:
            await AuthRepository.create_tenant(conn, tenant_id, tenant_name)
            await AuthRepository.create_user(
                conn,
                user_id=user_id,
                tenant_id=tenant_id,
                email=super_admin_email.lower(),
                password_hash=hashed_pw,
                full_name=full_name,
                role=SystemRole.SUPER_ADMIN.value,
                is_verified=True,
            )
            await AuthRepository.create_notification_preferences(conn, user_id)
            await AuthRepository.create_default_project(
                conn,
                project_id=project_id,
                tenant_id=tenant_id,
                name="Global Root Workspace",
                project_key="ROOT",
                created_by=user_id,
            )

        logger.info(
            "Predefined Super Admin '%s' bootstrap complete for tenant '%s' (User ID: %s, Role: SUPER_ADMIN).",
            super_admin_email,
            tenant_name,
            user_id,
        )

