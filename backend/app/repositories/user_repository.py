from typing import Any
import asyncmy

class UserRepository:
    """Repository handling raw MySQL queries for team member administration."""

    @staticmethod
    async def list_by_tenant(conn: asyncmy.Connection, tenant_id: str) -> list[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT id, tenant_id, full_name, email, role, is_active, created_at
                FROM users
                WHERE tenant_id = %s
                ORDER BY created_at ASC
            """
            await cursor.execute(sql, (tenant_id,))
            return await cursor.fetchall()

    @staticmethod
    async def get_by_email_in_tenant(conn: asyncmy.Connection, tenant_id: str, email: str) -> dict[str, Any] | None:
        async with conn.cursor() as cursor:
            sql = "SELECT id FROM users WHERE email = %s LIMIT 1"
            await cursor.execute(sql, (email.lower(),))
            return await cursor.fetchone()

    @staticmethod
    async def get_by_id_in_tenant(conn: asyncmy.Connection, tenant_id: str, user_id: str) -> dict[str, Any] | None:
        async with conn.cursor() as cursor:
            sql = "SELECT id, full_name, email, role, is_active FROM users WHERE id = %s AND tenant_id = %s LIMIT 1"
            await cursor.execute(sql, (user_id, tenant_id))
            return await cursor.fetchone()

    @staticmethod
    async def create_user(
        conn: asyncmy.Connection,
        user_id: str,
        tenant_id: str,
        email: str,
        password_hash: str,
        full_name: str,
        role: str,
        is_verified: bool = True,
    ) -> None:
        async with conn.cursor() as cursor:
            sql_user = """
                INSERT INTO users (id, tenant_id, email, password_hash, full_name, role, is_active, is_verified)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE, %s)
            """
            await cursor.execute(sql_user, (user_id, tenant_id, email.lower(), password_hash, full_name, role, is_verified))

            sql_prefs = """
                INSERT INTO notification_preferences (user_id, email_on_assignment, email_on_review, email_on_deadline, email_digest_daily)
                VALUES (%s, TRUE, TRUE, TRUE, FALSE)
            """
            await cursor.execute(sql_prefs, (user_id,))

    @staticmethod
    async def get_admin_emails_in_tenant(conn: asyncmy.Connection, tenant_id: str) -> list[str]:
        """Fetch emails of all active administrators in the organization."""
        async with conn.cursor() as cursor:
            sql = """
                SELECT email FROM users
                WHERE tenant_id = %s AND role IN ('ADMIN', 'SUPER_ADMIN') AND is_active = TRUE
            """
            await cursor.execute(sql, (tenant_id,))
            rows = await cursor.fetchall()
            return [r["email"] for r in rows if r.get("email")]
