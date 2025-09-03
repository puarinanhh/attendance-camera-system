# app/models/audit.py
from sqlalchemy import Column, String, JSON, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.base import BaseModel

class AuditLog(Base, BaseModel):
    __tablename__ = "audit_logs"
    
    # User and Action
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(String(50), nullable=False)  # create, update, delete, login, logout
    
    # Target Information
    entity_type = Column(String(50))  # employee, attendance, leave, etc.
    entity_id = Column(UUID(as_uuid=True))
    
    # Changes
    old_values = Column(JSON)
    new_values = Column(JSON)
    
    # Request Information
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    endpoint = Column(String(255))
    method = Column(String(10))
    
    # Additional Context
    description = Column(Text)
    metadata_json = Column(JSON)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")