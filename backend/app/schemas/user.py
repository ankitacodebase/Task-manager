from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.core.enums import SystemRole

# --- Request Schemas ---

class CreateUserRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, description="Full name of the team member")
    email: EmailStr = Field(..., description="Unique email address for account access")
    password: str = Field(..., min_length=8, max_length=128, description="Initial password (minimum 8 characters)")
    role: SystemRole = Field(default=SystemRole.USER, description="System role: USER or ADMIN")

# --- Response Schemas ---

class UserResponse(BaseModel):
    id: str
    tenant_id: str
    full_name: str
    email: str
    role: SystemRole
    is_active: bool
    is_verified: bool = False
    created_at: Optional[datetime] = None
