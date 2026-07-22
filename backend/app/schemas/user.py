"""Pydantic schemas."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    name: str = Field(..., min_length=1)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[dict] = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    subscription_status: str
    subscription_plan: str
    kyc_verified: bool
    api_calls_today: int
    total_tokens_used: int
    created_at: datetime
    class Config:
        from_attributes = True


class FileAttachment(BaseModel):
    name: str
    url: str
    type: str = "application/octet-stream"

class ChatRequest(BaseModel):
    model: str
    message: str
    session_id: Optional[str] = None
    prompt_template: Optional[str] = None
    files: Optional[list[FileAttachment]] = None


class ChatResponse(BaseModel):
    model: str
    response: str
    tokens_used: int
    image_url: Optional[str] = None
    reasoning: Optional[str] = None


class ImageRequest(BaseModel):
    prompt: str


class ImageResponse(BaseModel):
    image_url: str


class PaymentRequest(BaseModel):
    plan: str
    amount: float
    upi_id: str


class PaymentResponse(BaseModel):
    id: UUID
    plan: str
    amount: float
    upi_id: str
    status: str
    screenshot_path: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True


class PaymentApprove(BaseModel):
    status: str
    admin_notes: Optional[str] = None


class AdminUserResponse(BaseModel):
    id: UUID
    email: str
    name: str
    role: str
    subscription_status: str
    subscription_plan: str
    kyc_verified: bool
    api_calls_today: int
    total_tokens_used: int
    created_at: datetime
    class Config:
        from_attributes = True


class AdminPaymentResponse(BaseModel):
    id: UUID
    user_name: str
    user_email: str
    plan: str
    amount: float
    upi_id: str
    screenshot_path: Optional[str]
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
