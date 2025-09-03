# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Integer
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base
from app.models.base import BaseModel
import enum

class UserRole(enum.Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    HR = "hr"
    MANAGER = "manager"
    EMPLOYEE = "employee"
    SECURITY = "security"

class User(Base, BaseModel):
    __tablename__ = "users"
    
    # Authentication
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # User Information
    full_name = Column(String(255))
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), unique=True)
    
    # Role and Permissions
    role = Column(Enum(UserRole), default=UserRole.EMPLOYEE)
    permissions = Column(JSON, default={})
    
    # Security
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    failed_login_attempts = Column(Integer, default=0)
    last_login = Column(DateTime)
    last_login_ip = Column(String(50))
    
    # Two Factor Authentication
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(255))
    
    # Password Management
    password_changed_at = Column(DateTime)
    password_reset_token = Column(String(255))
    password_reset_expires = Column(DateTime)
    
    # Session Management
    refresh_token = Column(String(500))
    refresh_token_expires = Column(DateTime)
    
    # Relationships
    employee = relationship("Employee", backref="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")