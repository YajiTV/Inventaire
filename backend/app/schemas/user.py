from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ReadModel
from app.schemas.enums import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=1, max_length=120)
    role: UserRole = UserRole.OPERATOR


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    role: UserRole | None = None
    is_active: bool | None = None


class UserRead(ReadModel, UserBase):
    id: int
    is_active: bool
    created_at: datetime
