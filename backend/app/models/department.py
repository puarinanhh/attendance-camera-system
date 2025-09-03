# app/models/department.py
from sqlalchemy import Column, String, Boolean, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel

class Department(Base, BaseModel):
    __tablename__ = "departments"
    
    # Department Information
    department_code = Column(String(20), unique=True, nullable=False)
    department_name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Hierarchy
    parent_department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    department_level = Column(Integer, default=1)
    
    # Manager
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    
    # Contact
    email = Column(String(255))
    phone = Column(String(20))
    location = Column(String(255))
    
    # Status
    is_active = Column(Boolean, default=True)
    employee_count = Column(Integer, default=0)
    
    # Budget and Cost Center
    cost_center = Column(String(50))
    budget_code = Column(String(50))
    
    # Relationships
    employees = relationship("Employee", back_populates="department", foreign_keys="Employee.department_id")
    manager = relationship("Employee", foreign_keys=[manager_id])
    sub_departments = relationship("Department", backref="parent_department", remote_side="Department.id")