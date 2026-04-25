from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Token Schemas ---
class TokenCreate(BaseModel):
    phone_number: str
    priority_reason: Optional[str] = None

class TokenResponse(BaseModel):
    id: str
    token_number: str
    phone_number: str
    priority: int
    priority_reason: Optional[str] = None
    status: str
    issued_at: datetime
    called_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    estimated_wait_seconds: int

    class Config:
        from_attributes = True

# --- Queue Schemas ---
class QueueResponse(BaseModel):
    id: int
    name: str
    location: str
    status: str
    active_counters: int
    avg_service_time_seconds: int
    currently_serving: Optional[str] = None

    class Config:
        from_attributes = True

# --- Admin Action Schemas ---
class EscalateRequest(BaseModel):
    new_priority: int
    reason: str

class QueueStatusUpdate(BaseModel):
    status: str # OPEN, PAUSED, CLOSED
