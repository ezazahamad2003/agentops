"""
Pydantic models for user management
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    """Model for creating a new user"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """Model for user login"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Model for user response (without password)"""
    id: str
    email: str
    full_name: Optional[str]
    created_at: datetime
    is_active: bool


class TokenResponse(BaseModel):
    """Model for authentication token response"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class APIKeyCreate(BaseModel):
    """Model for creating an API key"""
    name: str = Field(..., description="Friendly name for the API key")


class APIKeyResponse(BaseModel):
    """Model for API key response"""
    id: str
    name: str
    key: str  # Only shown once during creation
    created_at: datetime
    last_used_at: Optional[datetime]
    is_active: bool


class APIKeyListItem(BaseModel):
    """Model for API key list item (without actual key)"""
    id: str
    name: str
    key_preview: str  # e.g., "agops_...xyz"
    created_at: datetime
    last_used_at: Optional[datetime]
    is_active: bool

