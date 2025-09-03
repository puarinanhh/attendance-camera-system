# app/models/leave.py
from sqlalchemy import Column, String, Date, Boolean, ForeignKey, Enum, Text, Integer, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel
import enum

class LeaveType(enum.Enum):
    ANNUAL = "annual"
    SICK = "sick"
    PERSONAL = "personal"
    MATERNITY = "maternity"
    PATERNITY = "paternity"
    UNPAID = "unpaid"
    COMP_OFF = "comp_off"
    OTHER = "other"

class LeaveStatus(enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    CANCELLED = "cancelled"

class Leave(Base, BaseModel):
    __tablename__ = "leaves"
    
    # Foreign Keys
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    approved_by = Column(UUID(as_uuid=True), ForeignKey("employees.id"))
    
    # Leave Details
    leave_type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=False)
    
    # Half Day Options
    is_half_day = Column(Boolean, default=False)
    half_day_period = Column(String(20))  # 'morning' or 'afternoon'
    
    # Reason and Notes
    reason = Column(Text, nullable=False)
    attachment = Column(String(500))  # URL to attachment if any
    
    # Status
    status = Column(Enum(LeaveStatus), default=LeaveStatus.PENDING)
    approval_date = Column(DateTime)
    approval_notes = Column(Text)
    
    # Emergency Leave
    is_emergency = Column(Boolean, default=False)
    emergency_contact = Column(String(255))
    
    # Relationships
    employee = relationship("Employee", back_populates="leaves", foreign_keys=[employee_id])
    approver = relationship("Employee", foreign_keys=[approved_by])


class LeaveBalance(Base, BaseModel):
    __tablename__ = "leave_balances"
    
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    year = Column(Integer, nullable=False)
    leave_type = Column(Enum(LeaveType), nullable=False)
    
    # Balance Details
    total_allocated = Column(Integer, default=0)
    used = Column(Integer, default=0)
    remaining = Column(Integer, default=0)
    carried_forward = Column(Integer, default=0)
    
    # Relationships
    employee = relationship("Employee")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('employee_id', 'year', 'leave_type'),
    )