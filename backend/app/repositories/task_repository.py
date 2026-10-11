import uuid
from typing import Any, Optional
import asyncmy

class TaskRepository:
    """Repository handling raw MySQL queries for projects, counters, and tasks."""

    @staticmethod
    async def get_or_create_default_project(
        conn: asyncmy.Connection,
        tenant_id: str,
        user_id: str
    ) -> tuple[str, str]:
        async with conn.cursor() as cursor:
            sql = "SELECT id, project_key FROM projects WHERE tenant_id = %s ORDER BY created_at ASC LIMIT 1"
            await cursor.execute(sql, (tenant_id,))
            row = await cursor.fetchone()
            if row:
                return row["id"], row["project_key"]

            project_id = str(uuid.uuid4())
            project_key = "TASK"
            sql_proj = """
                INSERT INTO projects (id, tenant_id, name, project_key, description, status, created_by)
                VALUES (%s, %s, 'Main Project', %s, 'Default workspace project', 'ACTIVE', %s)
            """
            await cursor.execute(sql_proj, (project_id, tenant_id, project_key, user_id))
            sql_counter = "INSERT INTO project_counters (project_id, last_task_number) VALUES (%s, 0)"
            await cursor.execute(sql_counter, (project_id,))
            return project_id, project_key

    @staticmethod
    async def get_project_by_id(
        conn: asyncmy.Connection,
        tenant_id: str,
        project_id: str
    ) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = "SELECT id, project_key FROM projects WHERE id = %s AND tenant_id = %s LIMIT 1"
            await cursor.execute(sql, (project_id, tenant_id))
            return await cursor.fetchone()

    @staticmethod
    async def create_task(
        conn: asyncmy.Connection,
        tenant_id: str,
        project_id: str,
        project_key: str,
        title: str,
        description: Optional[str],
        priority: str,
        creator_id: str,
        assignee_id: Optional[str],
        due_date: Any
    ) -> str:
        async with conn.cursor() as cursor:
            # Atomic counter increment
            sql_upd = "UPDATE project_counters SET last_task_number = last_task_number + 1 WHERE project_id = %s"
            await cursor.execute(sql_upd, (project_id,))

            sql_cnt = "SELECT last_task_number FROM project_counters WHERE project_id = %s"
            await cursor.execute(sql_cnt, (project_id,))
            row = await cursor.fetchone()
            task_number = row["last_task_number"] if row else 1
            task_key = f"{project_key}-{task_number}"

            task_id = str(uuid.uuid4())
            sql_insert = """
                INSERT INTO tasks (
                    id, tenant_id, project_id, task_number, task_key,
                    title, description, status, priority, creator_id,
                    assignee_id, due_date, version, is_archived
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, 'TODO', %s, %s, %s, %s, 1, FALSE)
            """
            await cursor.execute(sql_insert, (
                task_id, tenant_id, project_id, task_number, task_key,
                title, description, priority, creator_id, assignee_id, due_date
            ))

            act_id = str(uuid.uuid4())
            sql_act = """
                INSERT INTO task_activities (id, tenant_id, task_id, user_id, activity_type, from_value, to_value)
                VALUES (%s, %s, %s, %s, 'STATUS_CHANGE', NULL, 'TODO')
            """
            await cursor.execute(sql_act, (act_id, tenant_id, task_id, creator_id))

            if assignee_id:
                act_assign = str(uuid.uuid4())
                sql_act_assign = """
                    INSERT INTO task_activities (id, tenant_id, task_id, user_id, activity_type, from_value, to_value)
                    VALUES (%s, %s, %s, %s, 'ASSIGNMENT', NULL, %s)
                """
                await cursor.execute(sql_act_assign, (act_assign, tenant_id, task_id, creator_id, assignee_id))

            return task_id

    @staticmethod
    async def create_project(
        conn: asyncmy.Connection,
        tenant_id: str,
        name: str,
        user_id: str,
        description: Optional[str] = None,
        custom_key: Optional[str] = None,
    ) -> tuple[str, str]:
        """Create a new project with unique project_key within the tenant."""
        async with conn.cursor() as cursor:
            # Generate key from project name (e.g. "Mobile App" -> "MOB", "Backend" -> "BACK")
            if custom_key:
                project_key = custom_key.strip().upper()[:10]
            else:
                words = [w for w in name.strip().split() if w]
                if len(words) >= 2:
                    raw_key = "".join(w[0] for w in words[:4]).upper()
                else:
                    raw_key = name.strip()[:4].upper()
                clean_key = "".join(c for c in raw_key if c.isalnum()) or "PRJ"
                project_key = clean_key[:6]

            # Ensure unique project_key in this tenant
            sql_check = "SELECT id FROM projects WHERE tenant_id = %s AND project_key = %s LIMIT 1"
            await cursor.execute(sql_check, (tenant_id, project_key))
            existing = await cursor.fetchone()
            if existing:
                project_key = f"{project_key[:4]}{str(uuid.uuid4())[:2].upper()}"

            project_id = str(uuid.uuid4())
            sql_proj = """
                INSERT INTO projects (id, tenant_id, name, project_key, description, status, created_by)
                VALUES (%s, %s, %s, %s, %s, 'ACTIVE', %s)
            """
            await cursor.execute(sql_proj, (project_id, tenant_id, name.strip(), project_key, description, user_id))

            sql_counter = "INSERT INTO project_counters (project_id, last_task_number) VALUES (%s, 0)"
            await cursor.execute(sql_counter, (project_id,))
            return project_id, project_key

    @staticmethod
    async def get_project_by_name(
        conn: asyncmy.Connection,
        tenant_id: str,
        name: str
    ) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = "SELECT id, name, project_key FROM projects WHERE tenant_id = %s AND LOWER(name) = LOWER(%s) LIMIT 1"
            await cursor.execute(sql, (tenant_id, name.strip()))
            return await cursor.fetchone()

    @staticmethod
    async def list_projects(
        conn: asyncmy.Connection,
        tenant_id: str
    ) -> list[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT 
                    p.id, p.tenant_id, p.name, p.project_key, p.description, p.status, p.created_at,
                    COUNT(t.id) AS task_count
                FROM projects p
                LEFT JOIN tasks t ON p.id = t.project_id AND t.is_archived = FALSE
                WHERE p.tenant_id = %s
                GROUP BY p.id
                ORDER BY p.created_at ASC
            """
            await cursor.execute(sql, (tenant_id,))
            return await cursor.fetchall()

    @staticmethod
    async def list_tasks(
        conn: asyncmy.Connection,
        tenant_id: str,
        status: Optional[str] = None,
        assignee_id: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> list[dict[str, Any]]:
        async with conn.cursor() as cursor:
            conditions = ["t.tenant_id = %s", "t.is_archived = FALSE"]
            params: list[Any] = [tenant_id]

            if status:
                conditions.append("t.status = %s")
                params.append(status)

            if assignee_id:
                conditions.append("t.assignee_id = %s")
                params.append(assignee_id)

            if project_id:
                conditions.append("t.project_id = %s")
                params.append(project_id)

            where_clause = " AND ".join(conditions)
            sql = f"""
                SELECT 
                    t.id, t.tenant_id, t.project_id, t.task_number, t.task_key,
                    t.title, t.description, t.status, t.priority, t.creator_id,
                    t.assignee_id, t.due_date, t.version, t.created_at, t.updated_at,
                    p.name AS project_name,
                    p.project_key AS project_key,
                    c.full_name AS creator_name,
                    c.email AS creator_email,
                    a.full_name AS assignee_name,
                    a.email AS assignee_email
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN users c ON t.creator_id = c.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE {where_clause}
                ORDER BY t.created_at DESC
            """
            await cursor.execute(sql, tuple(params))
            rows = await cursor.fetchall()
        
        if rows:
            task_ids = [r["id"] for r in rows]
            comments_map = await TaskRepository.get_comments_for_tasks(conn, tenant_id, task_ids)
            for r in rows:
                r["comments"] = comments_map.get(r["id"], [])
        return rows

    @staticmethod
    async def get_task_by_id(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_id: str
    ) -> Optional[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT 
                    t.id, t.tenant_id, t.project_id, t.task_number, t.task_key,
                    t.title, t.description, t.status, t.priority, t.creator_id,
                    t.assignee_id, t.due_date, t.version, t.created_at, t.updated_at,
                    p.name AS project_name,
                    p.project_key AS project_key,
                    c.full_name AS creator_name,
                    c.email AS creator_email,
                    a.full_name AS assignee_name,
                    a.email AS assignee_email
                FROM tasks t
                LEFT JOIN projects p ON t.project_id = p.id
                LEFT JOIN users c ON t.creator_id = c.id
                LEFT JOIN users a ON t.assignee_id = a.id
                WHERE t.id = %s AND t.tenant_id = %s
                LIMIT 1
            """
            await cursor.execute(sql, (task_id, tenant_id))
            row = await cursor.fetchone()
        
        if row:
            row["comments"] = await TaskRepository.get_comments_for_task(conn, tenant_id, task_id)
        return row

    @staticmethod
    async def update_status(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_id: str,
        new_status: str,
        user_id: str,
        note: Optional[str] = None,
    ) -> bool:
        async with conn.cursor() as cursor:
            sql_prev = "SELECT status FROM tasks WHERE id = %s AND tenant_id = %s LIMIT 1"
            await cursor.execute(sql_prev, (task_id, tenant_id))
            row = await cursor.fetchone()
            if not row:
                return False
            
            old_status = row["status"]

            sql_upd = """
                UPDATE tasks
                SET status = %s, version = version + 1
                WHERE id = %s AND tenant_id = %s
            """
            await cursor.execute(sql_upd, (new_status, task_id, tenant_id))

            act_id = str(uuid.uuid4())
            sql_act = """
                INSERT INTO task_activities (id, tenant_id, task_id, user_id, activity_type, from_value, to_value)
                VALUES (%s, %s, %s, %s, 'STATUS_CHANGE', %s, %s)
            """
            await cursor.execute(sql_act, (act_id, tenant_id, task_id, user_id, old_status, new_status))

            # Store transition note in task_comments if provided
            if note and note.strip():
                comm_id = str(uuid.uuid4())
                sql_comm = """
                    INSERT INTO task_comments (id, tenant_id, task_id, user_id, content)
                    VALUES (%s, %s, %s, %s, %s)
                """
                await cursor.execute(sql_comm, (comm_id, tenant_id, task_id, user_id, note.strip()))

            return True

    @staticmethod
    async def assign_task(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_id: str,
        assignee_id: Optional[str],
        user_id: str,
    ) -> bool:
        async with conn.cursor() as cursor:
            sql_prev = "SELECT assignee_id FROM tasks WHERE id = %s AND tenant_id = %s LIMIT 1"
            await cursor.execute(sql_prev, (task_id, tenant_id))
            row = await cursor.fetchone()
            if not row:
                return False

            old_assignee = row["assignee_id"]

            sql_upd = """
                UPDATE tasks
                SET assignee_id = %s, version = version + 1
                WHERE id = %s AND tenant_id = %s
            """
            await cursor.execute(sql_upd, (assignee_id, task_id, tenant_id))

            act_id = str(uuid.uuid4())
            sql_act = """
                INSERT INTO task_activities (id, tenant_id, task_id, user_id, activity_type, from_value, to_value)
                VALUES (%s, %s, %s, %s, 'ASSIGNMENT', %s, %s)
            """
            await cursor.execute(sql_act, (act_id, tenant_id, task_id, user_id, old_assignee, assignee_id))
            return True

    @staticmethod
    async def add_comment(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_id: str,
        user_id: str,
        content: str,
    ) -> dict[str, Any]:
        comm_id = str(uuid.uuid4())
        async with conn.cursor() as cursor:
            sql_comm = """
                INSERT INTO task_comments (id, tenant_id, task_id, user_id, content)
                VALUES (%s, %s, %s, %s, %s)
            """
            await cursor.execute(sql_comm, (comm_id, tenant_id, task_id, user_id, content.strip()))

            act_id = str(uuid.uuid4())
            sql_act = """
                INSERT INTO task_activities (id, tenant_id, task_id, user_id, activity_type, from_value, to_value)
                VALUES (%s, %s, %s, %s, 'COMMENT_ADDED', NULL, %s)
            """
            await cursor.execute(sql_act, (act_id, tenant_id, task_id, user_id, comm_id))

            sql_fetch = """
                SELECT tc.id, tc.task_id, tc.user_id, tc.content, tc.created_at, u.full_name AS user_name
                FROM task_comments tc
                LEFT JOIN users u ON tc.user_id = u.id
                WHERE tc.id = %s AND tc.tenant_id = %s
                LIMIT 1
            """
            await cursor.execute(sql_fetch, (comm_id, tenant_id))
            return await cursor.fetchone()

    @staticmethod
    async def get_comments_for_task(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_id: str,
    ) -> list[dict[str, Any]]:
        async with conn.cursor() as cursor:
            sql = """
                SELECT tc.id, tc.task_id, tc.user_id, tc.content, tc.created_at, u.full_name AS user_name
                FROM task_comments tc
                LEFT JOIN users u ON tc.user_id = u.id
                WHERE tc.task_id = %s AND tc.tenant_id = %s AND tc.is_deleted = FALSE
                ORDER BY tc.created_at ASC
            """
            await cursor.execute(sql, (task_id, tenant_id))
            return await cursor.fetchall()

    @staticmethod
    async def get_comments_for_tasks(
        conn: asyncmy.Connection,
        tenant_id: str,
        task_ids: list[str],
    ) -> dict[str, list[dict[str, Any]]]:
        if not task_ids:
            return {}
        result: dict[str, list[dict[str, Any]]] = {tid: [] for tid in task_ids}
        format_strings = ",".join(["%s"] * len(task_ids))
        sql = f"""
            SELECT tc.id, tc.task_id, tc.user_id, tc.content, tc.created_at, u.full_name AS user_name
            FROM task_comments tc
            LEFT JOIN users u ON tc.user_id = u.id
            WHERE tc.tenant_id = %s AND tc.task_id IN ({format_strings}) AND tc.is_deleted = FALSE
            ORDER BY tc.created_at ASC
        """
        async with conn.cursor() as cursor:
            await cursor.execute(sql, (tenant_id, *task_ids))
            rows = await cursor.fetchall()
            for r in rows:
                t_id = r["task_id"]
                if t_id in result:
                    result[t_id].append(r)
        return result
