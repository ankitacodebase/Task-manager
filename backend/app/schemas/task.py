from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field, field_validator
from app.core.enums import TaskStatus, TaskPriority

# --- Request Schemas ---

class TaskCreateRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=255, description="Brief summary of the task")
    description: Optional[str] = Field(None, description="Detailed requirements or acceptance criteria")
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM, description="Task priority (LOW, MEDIUM, HIGH, URGENT)")
    assignee_id: Optional[str] = Field(None, description="User ID of the assigned team member")
    due_date: Optional[datetime] = Field(None, description="Target deadline for task completion")
    project_id: Optional[str] = Field(None, description="Existing project ID (optional)")
    project_name: Optional[str] = Field(None, description="New project name if creating a project on the fly (optional)")

    @field_validator("due_date")
    @classmethod
    def validate_due_date_not_past(cls, v: Optional[datetime]) -> Optional[datetime]:
        if v is not None:
            now_utc = datetime.now(timezone.utc)
            v_aware = v if v.tzinfo is not None else v.replace(tzinfo=timezone.utc)
            if v_aware.date() < now_utc.date():
                raise ValueError("Due date cannot be in the past. Please select today or a future date.")
        return v

class TaskStatusUpdateRequest(BaseModel):
    status: TaskStatus = Field(..., description="Target status transition (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, BLOCKED, DONE, CANCELLED)")
    note: Optional[str] = Field(None, max_length=1000, description="Optional transition note or status comment")

class TaskAssignRequest(BaseModel):
    assignee_id: Optional[str] = Field(None, description="User ID to assign, or null to unassign")

# --- Project Schemas ---

class ProjectCreateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Project name")
    description: Optional[str] = Field(None, description="Project summary description")

class ProjectResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    project_key: str
    description: Optional[str] = None
    status: str
    task_count: int = 0
    created_at: Optional[datetime] = None

# --- Comment Schemas ---

class CommentCreateRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000, description="Comment text")

class CommentResponse(BaseModel):
    id: str
    task_id: str
    user_id: str
    user_name: Optional[str] = None
    content: str
    created_at: Optional[datetime] = None

# --- Response Schemas ---

class TaskResponse(BaseModel):
    id: str
    tenant_id: str
    project_id: str
    project_name: Optional[str] = None
    project_key: Optional[str] = None
    task_key: str
    task_number: int
    title: str
    description: Optional[str] = None
    status: TaskStatus
    priority: TaskPriority
    creator_id: str
    creator_name: Optional[str] = None
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    assignee_email: Optional[str] = None
    due_date: Optional[datetime] = None
    version: int = 1
    comments: list[CommentResponse] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

