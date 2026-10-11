from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.core.enums import SystemRole

# --- Request Schemas ---

class RegisterRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2, max_length=100, description="Organization or workspace name")
    full_name: str = Field(..., min_length=2, max_length=100, description="Administrator full name")
    email: EmailStr = Field(..., description="Administrator email address")
    password: str = Field(..., min_length=8, max_length=128, description="Secure password (minimum 8 characters)")

class LoginRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")

class ForgotPasswordRequest(BaseModel):
    email: EmailStr = Field(..., description="Registered email address to request password reset")

class ResetPasswordRequest(BaseModel):
    token: str = Field(..., min_length=10, description="Password recovery token")
    new_password: str = Field(..., min_length=8, max_length=128, description="New secure password (minimum 8 characters)")

class SendOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address to receive the verification OTP code")

class VerifyOtpRequest(BaseModel):
    email: EmailStr = Field(..., description="Email address associated with the OTP")
    otp_code: str = Field(..., min_length=6, max_length=6, description="6-digit numeric verification code")

# --- Response Schemas ---

class UserSummaryResponse(BaseModel):
    id: str
    tenant_id: str
    tenant_name: Optional[str] = None
    email: str
    full_name: str
    role: SystemRole
    is_active: bool
    is_verified: bool = False

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSummaryResponse

class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: Optional[str] = None

class MessageResponse(BaseModel):
    message: str
