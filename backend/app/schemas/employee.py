from pydantic import BaseModel
from typing import Optional, List
from datetime import date
import uuid

class EmployeeBase(BaseModel):
    employee_code: str
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: str
    phone: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    position: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: bool = True

class EmployeeCreate(BaseModel):
    employee_code: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    position: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: bool = True

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[uuid.UUID] = None
    position: Optional[str] = None
    hire_date: Optional[date] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: uuid.UUID
    face_encoding: Optional[List[float]] = None
    face_images: Optional[List[str]] = None

    class Config:
        from_attributes = True
