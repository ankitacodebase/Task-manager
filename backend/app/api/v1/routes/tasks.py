from typing import Optional
from fastapi import APIRouter, Query
from app.core.enums import TaskStatus
from app.schemas.common import ApiResponse
from app.api.deps import DbDep, CurrentUser
from app.services.task_service import TaskService
from app.schemas.task import (
    TaskCreateRequest,
    TaskStatusUpdateRequest,
    TaskAssignRequest,
    TaskResponse,
    ProjectCreateRequest,
    ProjectResponse,
    CommentCreateRequest,
    CommentResponse,
)

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("/projects", response_model=ApiResponse[list[ProjectResponse]])
async def list_projects(
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[list[ProjectResponse]]:
    """List all projects in this organization with active task counts."""
    projects = await TaskService.list_projects(conn=conn, current_user=current_user)
    return ApiResponse(data=projects, message="Projects retrieved successfully.")

@router.post("/projects", response_model=ApiResponse[ProjectResponse], status_code=201)
async def create_project(
    req: ProjectCreateRequest,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[ProjectResponse]:
    """Create a new project in the organization."""
    project = await TaskService.create_project(
        conn=conn,
        current_user=current_user,
        name=req.name,
        description=req.description,
    )
    return ApiResponse(data=project, message="Project created successfully.")

@router.get("", response_model=ApiResponse[list[TaskResponse]])
async def list_tasks(
    current_user: CurrentUser,
    conn: DbDep,
    status: Optional[TaskStatus] = Query(None, description="Filter by lifecycle status (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED)"),
    assignee_id: Optional[str] = Query(None, description="Filter by assigned user ID (Admins only)"),
    project_id: Optional[str] = Query(None, description="Filter by project ID"),
) -> ApiResponse[list[TaskResponse]]:
    """List tasks (filtered by RBAC: Admins see all tenant tasks; Users see assigned tasks only)."""
    status_str = status.value if status else None
    tasks = await TaskService.list_tasks(
        conn=conn,
        current_user=current_user,
        status=status_str,
        requested_assignee_id=assignee_id,
        project_id=project_id,
    )
    return ApiResponse(data=tasks, message="Tasks retrieved successfully.")

@router.post("", response_model=ApiResponse[TaskResponse], status_code=201)
async def create_task(
    req: TaskCreateRequest,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[TaskResponse]:
    """Create a new task with sequential key (TASK-X) and notify assignee via email."""
    created_task = await TaskService.create_task(
        conn=conn,
        current_user=current_user,
        req=req,
    )
    return ApiResponse(data=created_task, message="Task created successfully.")

@router.get("/{task_id}", response_model=ApiResponse[TaskResponse])
async def get_task(
    task_id: str,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[TaskResponse]:
    """Get task details by ID with RBAC guard."""
    task = await TaskService.get_task_by_id(
        conn=conn,
        current_user=current_user,
        task_id=task_id,
    )
    return ApiResponse(data=task, message="Task retrieved successfully.")

@router.patch("/{task_id}/status", response_model=ApiResponse[TaskResponse])
async def update_task_status(
    task_id: str,
    req: TaskStatusUpdateRequest,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[TaskResponse]:
    """Update task lifecycle status (Users can update assigned tasks; Admins can update any task)."""
    updated_task = await TaskService.update_status(
        conn=conn,
        current_user=current_user,
        task_id=task_id,
        req=req,
    )
    return ApiResponse(data=updated_task, message=f"Task status updated to {req.status.value}.")

@router.patch("/{task_id}/assign", response_model=ApiResponse[TaskResponse])
async def assign_task(
    task_id: str,
    req: TaskAssignRequest,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[TaskResponse]:
    """Assign or reassign task to team member (Admins only, or self-claim if unassigned)."""
    updated_task = await TaskService.assign_task(
        conn=conn,
        current_user=current_user,
        task_id=task_id,
        req=req,
    )
    return ApiResponse(data=updated_task, message="Task assignment updated successfully.")

@router.post("/{task_id}/comments", response_model=ApiResponse[CommentResponse])
async def add_comment(
    task_id: str,
    req: CommentCreateRequest,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[CommentResponse]:
    """Add a comment to a task (available to Admin and team members)."""
    comment = await TaskService.add_comment(
        conn=conn,
        current_user=current_user,
        task_id=task_id,
        req=req,
    )
    return ApiResponse(data=comment, message="Comment posted successfully.")

@router.get("/{task_id}/comments", response_model=ApiResponse[list[CommentResponse]])
async def get_comments(
    task_id: str,
    current_user: CurrentUser,
    conn: DbDep,
) -> ApiResponse[list[CommentResponse]]:
    """List all comments for a task."""
    comments = await TaskService.get_comments(
        conn=conn,
        current_user=current_user,
        task_id=task_id,
    )
    return ApiResponse(data=comments, message="Comments retrieved successfully.")
