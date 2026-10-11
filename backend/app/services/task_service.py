from typing import Any, Optional
import asyncmy
from app.core.enums import TaskStatus, TaskPriority, SystemRole, ErrorCode
from app.core.exceptions import AppException
from app.repositories.task_repository import TaskRepository
from app.repositories.user_repository import UserRepository
from app.schemas.task import (
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    TaskAssignRequest,
    TaskResponse,
    CommentCreateRequest,
    CommentResponse,
)
from app.core.email import EmailService
from app.core.ws_manager import ws_manager

class TaskService:
    """
    Service layer executing core business logic, lifecycle rules, 
    and strict dual-layer Role-Based Access Control (RBAC).
    """

    @staticmethod
    def _map_to_response(row: dict[str, Any]) -> TaskResponse:
        raw_comments = row.get("comments") or []
        comments = [
            CommentResponse(
                id=c["id"],
                task_id=c["task_id"],
                user_id=c["user_id"],
                user_name=c.get("user_name"),
                content=c["content"],
                created_at=c.get("created_at"),
            )
            for c in raw_comments
        ]
        return TaskResponse(
            id=row["id"],
            tenant_id=row["tenant_id"],
            project_id=row["project_id"],
            project_name=row.get("project_name"),
            project_key=row.get("project_key"),
            task_key=row["task_key"],
            task_number=row["task_number"],
            title=row["title"],
            description=row.get("description"),
            status=TaskStatus(row["status"]),
            priority=TaskPriority(row["priority"]),
            creator_id=row["creator_id"],
            creator_name=row.get("creator_name"),
            assignee_id=row.get("assignee_id"),
            assignee_name=row.get("assignee_name"),
            assignee_email=row.get("assignee_email"),
            due_date=row.get("due_date"),
            version=row.get("version", 1),
            comments=comments,
            created_at=row.get("created_at"),
            updated_at=row.get("updated_at"),
        )

    @classmethod
    async def list_projects(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
    ) -> list[dict[str, Any]]:
        tenant_id = current_user["tenant_id"]
        return await TaskRepository.list_projects(conn, tenant_id)

    @classmethod
    async def create_project(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        name: str,
        description: Optional[str] = None,
    ) -> dict[str, Any]:
        tenant_id = current_user["tenant_id"]
        # Check if project already exists with this name
        existing = await TaskRepository.get_project_by_name(conn, tenant_id, name)
        if existing:
            p_row = await TaskRepository.get_project_by_id(conn, tenant_id, existing["id"])
            return p_row

        project_id, project_key = await TaskRepository.create_project(
            conn=conn,
            tenant_id=tenant_id,
            name=name,
            user_id=current_user["id"],
            description=description,
        )
        await conn.commit()
        return await TaskRepository.get_project_by_id(conn, tenant_id, project_id)

    @classmethod
    async def list_tasks(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        status: Optional[str] = None,
        requested_assignee_id: Optional[str] = None,
        project_id: Optional[str] = None,
    ) -> list[TaskResponse]:
        """
        RBAC Enforced Task Listing:
        - ADMIN / SUPER_ADMIN: Can view all organization tasks, or filter by any assignee/project.
        - USER (Team Member): Strictly restricted to tasks assigned to them.
        """
        tenant_id = current_user["tenant_id"]
        is_admin = current_user["role"] in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value)

        # RBAC Check: Standard users cannot inspect other members' tasks
        if not is_admin:
            effective_assignee = current_user["id"]
        else:
            effective_assignee = requested_assignee_id

        rows = await TaskRepository.list_tasks(
            conn=conn,
            tenant_id=tenant_id,
            status=status,
            assignee_id=effective_assignee,
            project_id=project_id,
        )
        return [cls._map_to_response(row) for row in rows]

    @classmethod
    async def create_task(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        req: TaskCreateRequest,
    ) -> TaskResponse:
        """
        RBAC Enforced Task Creation:
        - Admins create tasks and can assign to any member in the tenant.
        - Validates that the assignee actually belongs to this organization.
        - Supports choosing existing project or creating new project on the fly.
        """
        tenant_id = current_user["tenant_id"]

        # Validate assignee belongs to tenant
        if req.assignee_id:
            assignee = await UserRepository.get_by_id_in_tenant(conn, tenant_id, req.assignee_id)
            if not assignee:
                raise AppException(
                    status_code=404,
                    error_code=ErrorCode.NOT_FOUND_ERROR,
                    message="Specified assignee does not exist within this organization.",
                )

        # Resolve or create project
        if req.project_name and req.project_name.strip():
            # Check if exists by name, else create new
            existing_p = await TaskRepository.get_project_by_name(conn, tenant_id, req.project_name)
            if existing_p:
                project_id = existing_p["id"]
                project_key = existing_p["project_key"]
            else:
                project_id, project_key = await TaskRepository.create_project(
                    conn=conn,
                    tenant_id=tenant_id,
                    name=req.project_name.strip(),
                    user_id=current_user["id"],
                )
        elif req.project_id:
            p_row = await TaskRepository.get_project_by_id(conn, tenant_id, req.project_id)
            if not p_row:
                raise AppException(
                    status_code=404,
                    error_code=ErrorCode.NOT_FOUND_ERROR,
                    message="Project not found in this organization.",
                )
            project_id = p_row["id"]
            project_key = p_row["project_key"]
        else:
            project_id, project_key = await TaskRepository.get_or_create_default_project(
                conn, tenant_id, current_user["id"]
            )

        task_id = await TaskRepository.create_task(
            conn=conn,
            tenant_id=tenant_id,
            project_id=project_id,
            project_key=project_key,
            title=req.title,
            description=req.description,
            priority=req.priority.value,
            creator_id=current_user["id"],
            assignee_id=req.assignee_id,
            due_date=req.due_date,
        )
        await conn.commit()

        created_task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not created_task:
            raise AppException(
                status_code=500,
                error_code=ErrorCode.INTERNAL_SERVER_ERROR,
                message="Failed to retrieve newly created task.",
            )

        # Send email notification if assignee was assigned
        if req.assignee_id and created_task.get("assignee_email"):
            await EmailService.send_task_assignment(
                to_email=created_task["assignee_email"],
                assignee_name=created_task.get("assignee_name") or "Team Member",
                task_key=created_task["task_key"],
                task_title=created_task["title"],
            )

        # Broadcast real-time workspace update to all active connections in this tenant
        try:
            await ws_manager.broadcast_to_tenant(
                tenant_id,
                {"type": "TASK_CREATED", "task_id": created_task["id"]}
            )
        except Exception:
            pass

        return cls._map_to_response(created_task)

    @classmethod
    async def get_task_by_id(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        task_id: str,
    ) -> TaskResponse:
        """
        RBAC + Anti-IDOR:
        - Admin can inspect any task in the tenant.
        - Team Member can only inspect tasks assigned to them or created by them.
        """
        tenant_id = current_user["tenant_id"]
        task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not task:
            raise AppException(
                status_code=404,
                error_code=ErrorCode.NOT_FOUND_ERROR,
                message="Task not found in this organization.",
            )

        is_admin = current_user["role"] in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value)
        if not is_admin and task["assignee_id"] != current_user["id"] and task["creator_id"] != current_user["id"]:
            raise AppException(
                status_code=403,
                error_code=ErrorCode.AUTHORIZATION_ERROR,
                message="You do not have permission to view this task.",
            )

        return cls._map_to_response(task)

    @classmethod
    async def update_status(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        task_id: str,
        req: TaskStatusUpdateRequest,
    ) -> TaskResponse:
        """
        RBAC Status Machine:
        - Admin can transition any task status.
        - Team Member can ONLY transition tasks currently assigned to them.
        """
        tenant_id = current_user["tenant_id"]
        task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not task:
            raise AppException(
                status_code=404,
                error_code=ErrorCode.NOT_FOUND_ERROR,
                message="Task not found in this organization.",
            )

        is_admin = current_user["role"] in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value)
        if not is_admin and task["assignee_id"] != current_user["id"]:
            raise AppException(
                status_code=403,
                error_code=ErrorCode.AUTHORIZATION_ERROR,
                message="You can only update the status of tasks assigned to you.",
            )

        old_status = TaskStatus(task["status"])

        await TaskRepository.update_status(
            conn=conn,
            tenant_id=tenant_id,
            task_id=task_id,
            new_status=req.status.value,
            user_id=current_user["id"],
            note=req.note,
        )
        await conn.commit()

        updated = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)

        # Dispatch status update email notifications:
        # Rule: Never email the person who performed the update!
        # - If an Employee made the update:
        #     Do NOT email the employee. Notify Admin(s) and/or creator.
        # - If an Admin made the update:
        #     Do NOT email the admin. Notify the assigned employee.
        if old_status != req.status:
            is_updater_admin = current_user.get("role") in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value)
            updater_name = current_user.get("full_name") or "Team Member"
            current_user_email = current_user.get("email", "").lower()

            if not is_updater_admin:
                admin_emails = await UserRepository.get_admin_emails_in_tenant(conn, tenant_id)
                recipients = set(e.lower() for e in admin_emails)
                if updated.get("creator_email"):
                    recipients.add(updated["creator_email"].lower())
                recipients.discard(current_user_email)

                for target_email in recipients:
                    await EmailService.send_status_update(
                        to_email=target_email,
                        task_key=updated["task_key"],
                        task_title=updated["title"],
                        old_status=old_status,
                        new_status=req.status,
                        updated_by=f"{updater_name} (Team Member)",
                    )
            else:
                assignee_email = updated.get("assignee_email")
                if assignee_email and assignee_email.lower() != current_user_email:
                    await EmailService.send_status_update(
                        to_email=assignee_email,
                        task_key=updated["task_key"],
                        task_title=updated["title"],
                        old_status=old_status,
                        new_status=req.status,
                        updated_by=f"{updater_name} (Administrator)",
                    )

        # Broadcast real-time update
        try:
            await ws_manager.broadcast_to_tenant(
                tenant_id,
                {"type": "TASK_UPDATED", "task_id": task_id, "status": req.status.value}
            )
        except Exception:
            pass

        return cls._map_to_response(updated)

    @classmethod
    async def assign_task(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        task_id: str,
        req: TaskAssignRequest,
    ) -> TaskResponse:
        """
        RBAC Assignment:
        - Admin can assign/reassign any task.
        - Standard team members can only claim unassigned tasks for themselves.
        """
        tenant_id = current_user["tenant_id"]
        task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not task:
            raise AppException(
                status_code=404,
                error_code=ErrorCode.NOT_FOUND_ERROR,
                message="Task not found in this organization.",
            )

        is_admin = current_user["role"] in (SystemRole.ADMIN.value, SystemRole.SUPER_ADMIN.value)

        # Standard members can only self-claim if unassigned
        if not is_admin:
            if task["assignee_id"] is not None:
                raise AppException(
                    status_code=403,
                    error_code=ErrorCode.AUTHORIZATION_ERROR,
                    message="Only an Administrator can reassign already-assigned tasks.",
                )
            if req.assignee_id != current_user["id"]:
                raise AppException(
                    status_code=403,
                    error_code=ErrorCode.AUTHORIZATION_ERROR,
                    message="You can only claim tasks for yourself.",
                )

        if req.assignee_id:
            assignee = await UserRepository.get_by_id_in_tenant(conn, tenant_id, req.assignee_id)
            if not assignee:
                raise AppException(
                    status_code=404,
                    error_code=ErrorCode.NOT_FOUND_ERROR,
                    message="Target assignee does not exist in this organization.",
                )

        await TaskRepository.assign_task(
            conn=conn,
            tenant_id=tenant_id,
            task_id=task_id,
            assignee_id=req.assignee_id,
            user_id=current_user["id"],
        )
        await conn.commit()

        updated = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)

        # Dispatch task assignment notification
        if req.assignee_id and updated.get("assignee_email"):
            await EmailService.send_task_assignment(
                to_email=updated["assignee_email"],
                assignee_name=updated.get("assignee_name") or "Team Member",
                task_key=updated["task_key"],
                task_title=updated["title"],
            )

        # Broadcast real-time update
        try:
            await ws_manager.broadcast_to_tenant(
                tenant_id,
                {"type": "TASK_UPDATED", "task_id": task_id, "assignee_id": req.assignee_id}
            )
        except Exception:
            pass

        return cls._map_to_response(updated)

    @classmethod
    async def add_comment(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        task_id: str,
        req: CommentCreateRequest,
    ) -> CommentResponse:
        """
        Add comment to a task and broadcast real-time update to all active sessions in the tenant.
        """
        tenant_id = current_user["tenant_id"]
        task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not task:
            raise AppException(
                status_code=404,
                error_code=ErrorCode.NOT_FOUND_ERROR,
                message="Task not found in this organization.",
            )

        comment_row = await TaskRepository.add_comment(
            conn=conn,
            tenant_id=tenant_id,
            task_id=task_id,
            user_id=current_user["id"],
            content=req.content,
        )
        await conn.commit()

        # Real-time broadcast
        try:
            await ws_manager.broadcast_to_tenant(
                tenant_id,
                {
                    "type": "COMMENT_ADDED",
                    "task_id": task_id,
                    "user_id": current_user["id"],
                    "user_name": current_user.get("full_name"),
                }
            )
        except Exception:
            pass

        return CommentResponse(
            id=comment_row["id"],
            task_id=comment_row["task_id"],
            user_id=comment_row["user_id"],
            user_name=comment_row.get("user_name"),
            content=comment_row["content"],
            created_at=comment_row.get("created_at"),
        )

    @classmethod
    async def get_comments(
        cls,
        conn: asyncmy.Connection,
        current_user: dict[str, Any],
        task_id: str,
    ) -> list[CommentResponse]:
        """
        Retrieve all non-deleted comments for a task.
        """
        tenant_id = current_user["tenant_id"]
        task = await TaskRepository.get_task_by_id(conn, tenant_id, task_id)
        if not task:
            raise AppException(
                status_code=404,
                error_code=ErrorCode.NOT_FOUND_ERROR,
                message="Task not found in this organization.",
            )

        rows = await TaskRepository.get_comments_for_task(conn, tenant_id, task_id)
        return [
            CommentResponse(
                id=r["id"],
                task_id=r["task_id"],
                user_id=r["user_id"],
                user_name=r.get("user_name"),
                content=r["content"],
                created_at=r.get("created_at"),
            )
            for r in rows
        ]
