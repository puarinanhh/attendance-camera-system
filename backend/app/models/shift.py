# app/models/shift.py
from sqlalchemy import Column, String, Time, Integer, Boolean, JSON, Date, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel

class WorkShift(Base, BaseModel):
    __tablename__ = "work_shifts"
    
    # Shift Information
    shift_name = Column(String(100), nullable=False, unique=True)
    shift_code = Column(String(20), unique=True)
    
    # Timing
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    break_start = Column(Time)
    break_end = Column(Time)
    
    # Flexibility Settings
    late_threshold_minutes = Column(Integer, default=15)  # Minutes allowed to be late
    early_leave_threshold_minutes = Column(Integer, default=15)
    overtime_threshold_minutes = Column(Integer, default=30)
    
    # Work Days (JSON array of weekdays: [1,2,3,4,5] for Mon-Fri)
    work_days = Column(JSON, default=[1, 2, 3, 4, 5])
    
    # Status
    is_active = Column(Boolean, default=True)
    is_flexible = Column(Boolean, default=False)  # Flexible timing allowed
    
    # Additional Settings
    require_face_recognition = Column(Boolean, default=True)
    require_location = Column(Boolean, default=False)
    allowed_locations = Column(JSON)  # Array of allowed GPS coordinates
    
    # Relationships
    employee_shifts = relationship("EmployeeShift", back_populates="shift")
    attendance_records = relationship("AttendanceRecord", back_populates="shift")


class EmployeeShift(Base, BaseModel):
    __tablename__ = "employee_shifts"
    
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    shift_id = Column(UUID(as_uuid=True), ForeignKey("work_shifts.id"), nullable=False)
    
    # Validity Period
    effective_date = Column(Date, nullable=False)
    end_date = Column(Date)
    
    # Status
    is_active = Column(Boolean, default=True)
    is_primary = Column(Boolean, default=True)  # Primary shift for the employee
    
    # Custom Settings (Override shift settings)
    custom_start_time = Column(Time)
    custom_end_time = Column(Time)
    custom_work_days = Column(JSON)
    
    # Relationships
    employee = relationship("Employee", back_populates="shifts")
    shift = relationship("WorkShift", back_populates="employee_shifts")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('employee_id', 'effective_date', 'shift_id'),
    )