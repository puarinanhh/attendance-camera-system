# app/models/attendance.py
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON, Enum, Date, Time, Text, Boolean, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel
import enum

class AttendanceStatus(enum.Enum):
    ON_TIME = "on_time"
    LATE = "late"
    EARLY_LEAVE = "early_leave"
    ABSENT = "absent"
    HOLIDAY = "holiday"
    LEAVE = "leave"
    OVERTIME = "overtime"

class AttendanceRecord(Base, BaseModel):
    __tablename__ = "attendance_records"
    
    # Foreign Keys
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    shift_id = Column(UUID(as_uuid=True), ForeignKey("work_shifts.id"))
    
    # Check-in/out Times
    check_in_time = Column(DateTime)
    check_out_time = Column(DateTime)
    
    # Scheduled Times (from shift)
    scheduled_in = Column(Time)
    scheduled_out = Column(Time)
    
    # Images
    check_in_image = Column(String(500))  # URL to check-in photo
    check_out_image = Column(String(500))  # URL to check-out photo
    
    # Location Data
    check_in_location = Column(String(255))
    check_out_location = Column(String(255))
    check_in_coords = Column(JSON)  # {"lat": 10.7769, "lng": 106.7009}
    check_out_coords = Column(JSON)
    
    # Device Information
    check_in_device = Column(JSON)  # Device info for check-in
    check_out_device = Column(JSON)  # Device info for check-out
    
    # Status and Calculations
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.ON_TIME)
    work_hours = Column(Float)  # Total hours worked
    overtime_hours = Column(Float, default=0)
    late_minutes = Column(Float, default=0)
    early_leave_minutes = Column(Float, default=0)
    
    # Additional Information
    notes = Column(Text)
    is_manual_entry = Column(Boolean, default=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    approval_notes = Column(Text)
    
    # Face Recognition Confidence
    check_in_confidence = Column(Float)  # Face recognition confidence score
    check_out_confidence = Column(Float)
    
    # Relationships
    employee = relationship("Employee", back_populates="attendance_records", foreign_keys=[employee_id])
    shift = relationship("WorkShift", back_populates="attendance_records")
    approver = relationship("Employee", foreign_keys=[approved_by])

# app/models/attendance.py (continued)

class AttendanceSummary(Base, BaseModel):
    __tablename__ = "attendance_summaries"
    
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    
    # Summary Statistics
    total_days = Column(Integer, default=0)
    present_days = Column(Integer, default=0)
    absent_days = Column(Integer, default=0)
    late_days = Column(Integer, default=0)
    early_leave_days = Column(Integer, default=0)
    leave_days = Column(Integer, default=0)
    holiday_days = Column(Integer, default=0)
    
    # Hours Statistics
    total_work_hours = Column(Float, default=0)
    total_overtime_hours = Column(Float, default=0)
    average_work_hours = Column(Float, default=0)
    
    # Performance Metrics
    punctuality_rate = Column(Float, default=0)  # Percentage
    attendance_rate = Column(Float, default=0)   # Percentage
    
    # Relationships
    employee = relationship("Employee")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('employee_id', 'month', 'year'),
    )