from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Queue(Base):
    __tablename__ = "queues"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), default="City Medical Center")
    location = Column(String(255), default="Main Wing, Floor 1")
    status = Column(String(20), default="OPEN") # OPEN, PAUSED, CLOSED
    active_counters = Column(Integer, default=3)
    avg_service_time_seconds = Column(Integer, default=300)
    currently_serving = Column(String(50), nullable=True)

class Token(Base):
    __tablename__ = "tokens"
    id = Column(String(36), primary_key=True, index=True) # UUID
    token_number = Column(String(10), index=True) # A001
    phone_number = Column(String(15))
    priority = Column(Integer, default=3) # 0=Critical, 1=Urgent, 2=Priority, 3=Regular
    priority_reason = Column(String(100), nullable=True)
    status = Column(String(20), default="WAITING") # WAITING, CALLED, COMPLETED, CANCELLED, NO_SHOW
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)
    called_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    estimated_wait_seconds = Column(Integer, default=0)

class ServiceSession(Base):
    __tablename__ = "service_sessions"
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(String(36), ForeignKey("tokens.id"))
    admin_id = Column(Integer, ForeignKey("admins.id"))
    duration_seconds = Column(Integer)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

class PriorityAuditLog(Base):
    __tablename__ = "priority_audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    token_id = Column(String(36), ForeignKey("tokens.id"))
    admin_id = Column(Integer, ForeignKey("admins.id"))
    old_priority = Column(Integer)
    new_priority = Column(Integer)
    reason = Column(String(500))
    changed_at = Column(DateTime, default=datetime.datetime.utcnow)

class Admin(Base):
    __tablename__ = "admins"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
