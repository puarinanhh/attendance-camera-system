# app/models/employee.py
from sqlalchemy import Column, String, Boolean, Date, Text, ARRAY, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel
import uuid

class Employee(Base, BaseModel):
    __tablename__ = "employees"
    
    # Basic Information
    employee_code = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    
    # Contact Information
    email = Column(String(255), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    address = Column(Text)
    
    # Work Information
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"))
    position = Column(String(100))
    job_title = Column(String(100))
    manager_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    
    # Employment Details
    hire_date = Column(Date)
    employment_status = Column(String(50), default="active")  # active, inactive, terminated, on_leave
    employee_type = Column(String(50), default="full_time")  # full_time, part_time, contract, intern
    
    # Face Recognition
    face_encoding = Column(ARRAY(Float))  # Array of face encoding vectors
    face_images = Column(ARRAY(String))   # URLs to stored face images
    
    # Account Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Additional Info
    emergency_contact = Column(String(255))
    emergency_phone = Column(String(20))
    notes = Column(Text)
    
    # Relationships
    department = relationship("Department", back_populates="employees", foreign_keys=[department_id])
    attendance_records = relationship(
        "AttendanceRecord",
        back_populates="employee",
        foreign_keys="AttendanceRecord.employee_id",
    )
    managed_employees = relationship("Employee", backref="manager", remote_side="Employee.id")
    shifts = relationship("EmployeeShift", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee", foreign_keys="Leave.employee_id")