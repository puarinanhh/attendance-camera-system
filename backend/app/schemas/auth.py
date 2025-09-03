from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from app.models.user import UserRole

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.EMPLOYEE

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    full_name: Optional[str] = None

    class Config:
        from_attributes = True
        use_enum_values = True
