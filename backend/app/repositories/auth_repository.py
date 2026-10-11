from datetime import datetime
from typing import Any, Optional
import asyncmy

class AuthRepository:
    """Repository handling raw MySQL queries for tenants and authentication."""

    @staticmethod
    async def create_tenant(conn: asyncmy.Connection, tenant_id: str, name: str) -> None:
        async with conn.cursor() as cursor:
            sql = "INSERT INTO tenants (id, name, status) VALUES (%s, %s, 'ACTIVE')"
            await cursor.execute(sql, (tenant_id, name))

    @staticmethod
    async def create_user(
        conn: asyncmy.Connection,
        user_id: str,
        tenant_id: str,
        email: str,
        password_hash: str,
        full_name: str,
        role: str,
        is_verified: bool = False,
    ) -> None:
        async with conn.cursor() as cursor:
            sql = """
                INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s)
            """
            await cursor.execute(sql, (user_id, tenant_id, email, password_hash, full_name, role, is_verified))

    @staticmethod
    async def create_notification_preferences(conn: asyncmy.Connection, user_id: str) -> None:
        async with conn.cursor() as cursor:
            sql = """
                INSERT INTO notification_preferences (user_id, email_on_assignment, email_on_review, email_on_deadline, email_digest_daily)
                VALUES (%s, TRUE, TRUE, TRUE, FALSE)
            """
            await cursor.execute(sql, (user_id,))

    @staticmethod
    async def create_default_project(
        conn: asyncmy.Connection,
        project_id: str,
        tenant_id: str,
        name: str,
        project_key: str,
        created_by: str
    ) -> None:
        async with conn.cursor() as cursor:
            # 1. Project
            sql_proj = """
                INSERT INTO projects (id, tenant_id, name, project_key, description, status, created_by)
                VALUES (%s, %s, %s, %s, 'Default main workspace project', 'ACTIVE', %s)
            """
            await cursor.execute(sql_proj, (project_id, tenant_id, name, project_key, created_by))
            
            # 2. Counter
            sql_counter = "INSERT INTO project_counters (project_id, last_task_number) VALUES (%s, 0)"
            await cursor.execute(sql_counter, (project_id,))

            # 3. Project Member (Manager)
            import uuid
            member_id = str(uuid.uuid4())
            sql_member = """
                INSERT INTO project_members (id, tenant_id, project_id, user_id, role)
                VALUES (%s, %s, %s, %s, 'MANAGER')
            """
            await cursor.execute(sql_member, (member_id, tenant_id, project_id, created_by))

    @staticmethod
    async def get_user_by_email(conn: asyncmy.Connection, email: str) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT u.*, t.name as tenant_name, t.status as tenant_status
                FROM users u
                JOIN tenants t ON u.tenant_id = t.id
                WHERE u.email = %s
                LIMIT 1
            """
            await cursor.execute(sql, (email.lower(),))
            return await cursor.fetchone()

    @staticmethod
    async def get_user_by_id(conn: asyncmy.Connection, user_id: str) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT u.*, t.name as tenant_name, t.status as tenant_status
                FROM users u
                JOIN tenants t ON u.tenant_id = t.id
                WHERE u.id = %s
                LIMIT 1
            """
            await cursor.execute(sql, (user_id,))
            return await cursor.fetchone()

    @staticmethod
    async def update_failed_attempts(
        conn: asyncmy.Connection,
        user_id: str,
        attempts: int,
        lockout_until: Optional[datetime]
    ) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET failed_login_attempts = %s, lockout_until = %s WHERE id = %s"
            await cursor.execute(sql, (attempts, lockout_until, user_id))

    @staticmethod
    async def reset_failed_attempts(conn: asyncmy.Connection, user_id: str) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET failed_login_attempts = 0, lockout_until = NULL WHERE id = %s"
            await cursor.execute(sql, (user_id,))

    @staticmethod
    async def set_reset_token(
        conn: asyncmy.Connection,
        user_id: str,
        token_hash: str,
        expires_at: datetime
    ) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET reset_token_hash = %s, reset_token_expires_at = %s WHERE id = %s"
            await cursor.execute(sql, (token_hash, expires_at, user_id))

    @staticmethod
    async def get_user_by_reset_token(conn: asyncmy.Connection, token_hash: str) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT u.*, t.name as tenant_name
                FROM users u
                JOIN tenants t ON u.tenant_id = t.id
                WHERE u.reset_token_hash = %s
                LIMIT 1
            """
            await cursor.execute(sql, (token_hash,))
            return await cursor.fetchone()

    @staticmethod
    async def update_password(conn: asyncmy.Connection, user_id: str, password_hash: str) -> None:
        async with conn.cursor() as cursor:
            sql = """
                UPDATE users
                SET password_hash = %s, reset_token_hash = NULL, reset_token_expires_at = NULL, failed_login_attempts = 0, lockout_until = NULL
                WHERE id = %s
            """
            await cursor.execute(sql, (password_hash, user_id))

    @staticmethod
    async def set_email_otp(conn: asyncmy.Connection, user_id: str, otp_hash: str, expires_at: datetime) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET email_otp_hash = %s, email_otp_expires_at = %s WHERE id = %s"
            await cursor.execute(sql, (otp_hash, expires_at, user_id))

    @staticmethod
    async def clear_email_otp(conn: asyncmy.Connection, user_id: str) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET email_otp_hash = NULL, email_otp_expires_at = NULL WHERE id = %s"
            await cursor.execute(sql, (user_id,))

    @staticmethod
    async def mark_user_verified(conn: asyncmy.Connection, user_id: str) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE users SET is_verified = TRUE, email_otp_hash = NULL, email_otp_expires_at = NULL WHERE id = %s"
            await cursor.execute(sql, (user_id,))

    @staticmethod
    async def update_unverified_user(
        conn: asyncmy.Connection,
        user_id: str,
        password_hash: str,
        full_name: str,
    ) -> None:
        async with conn.cursor() as cursor:
            sql = """
                UPDATE users
                SET password_hash = %s, full_name = %s
                WHERE id = %s
            """
            await cursor.execute(sql, (password_hash, full_name, user_id))

    @staticmethod
    async def update_tenant_name(
        conn: asyncmy.Connection,
        tenant_id: str,
        name: str,
    ) -> None:
        async with conn.cursor() as cursor:
            sql = "UPDATE tenants SET name = %s WHERE id = %s"
            await cursor.execute(sql, (name, tenant_id))

