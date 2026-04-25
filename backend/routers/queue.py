from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from database import get_db
import models, schemas
import uuid

router = APIRouter(prefix="/api/queue", tags=["Queue"])

def get_sorted_waiting_tokens(db: Session):
    """
    CORE ALGORITHM: Section 6.3 Priority Queue Ordering Algorithm
    Returns all WAITING tokens strictly ordered by:
    1. priority (ASC) - 0 is Critical, 3 is Regular
    2. issued_at (ASC) - FIFO within the same priority tier
    """
    return db.query(models.Token).filter(
        models.Token.status == "WAITING"
    ).order_by(
        asc(models.Token.priority),
        asc(models.Token.issued_at)
    ).all()

@router.get("/waiting", response_model=list[schemas.TokenResponse])
def get_waiting_queue(db: Session = Depends(get_db)):
    """Returns the entire active queue sorted by priority and arrival time."""
    tokens = get_sorted_waiting_tokens(db)
    
    # Calculate effective wait times dynamically based on current position
    queue_settings = db.query(models.Queue).first()
    avg_service_time = queue_settings.avg_service_time_seconds if queue_settings else 300
    active_counters = queue_settings.active_counters if queue_settings and queue_settings.active_counters > 0 else 1

    for index, token in enumerate(tokens):
        # EWT = (Index / active_counters) * avg_service_time
        token.estimated_wait_seconds = int((index / active_counters) * avg_service_time)

    return tokens

@router.post("/token", response_model=schemas.TokenResponse)
def create_token(token_req: schemas.TokenCreate, db: Session = Depends(get_db)):
    """Creates a new token with Priority logic."""
    # Determine priority based on reason (User Self-Declaration logic from 6.2.1)
    priority_map = {
        "Emergency": 0,
        "Senior Citizen": 1,
        "Pregnant": 1,
        "Disability": 2,
        "None": 3
    }
    
    assigned_priority = 3 # Default Regular
    if token_req.priority_reason and token_req.priority_reason in priority_map:
        assigned_priority = priority_map[token_req.priority_reason]

    # Generate Token Number (simplified logic)
    prefix = "A"
    today_count = db.query(models.Token).count()
    token_number = f"{prefix}{str(today_count + 1).zfill(3)}"

    new_token = models.Token(
        id=str(uuid.uuid4()),
        token_number=token_number,
        phone_number=token_req.phone_number,
        priority=assigned_priority,
        priority_reason=token_req.priority_reason
    )
    
    db.add(new_token)
    db.commit()
    db.refresh(new_token)
    
    # Recalculate EWT for response
    all_waiting = get_sorted_waiting_tokens(db)
    queue_settings = db.query(models.Queue).first()
    avg_service_time = queue_settings.avg_service_time_seconds if queue_settings else 300
    active_counters = queue_settings.active_counters if queue_settings and queue_settings.active_counters > 0 else 1

    # Find position of the newly created token in the strictly sorted list
    try:
        position_index = [t.id for t in all_waiting].index(new_token.id)
        new_token.estimated_wait_seconds = int((position_index / active_counters) * avg_service_time)
    except ValueError:
        new_token.estimated_wait_seconds = 0
        
    return new_token

@router.get("/token/{token_id}", response_model=schemas.TokenResponse)
def get_token_status(token_id: str, db: Session = Depends(get_db)):
    """Retrieves a specific token and its live dynamic position/EWT."""
    token = db.query(models.Token).filter(models.Token.id == token_id).first()
    if not token:
        raise HTTPException(status_code=404, detail="Token not found")
        
    if token.status == "WAITING":
        all_waiting = get_sorted_waiting_tokens(db)
        queue_settings = db.query(models.Queue).first()
        avg_service_time = queue_settings.avg_service_time_seconds if queue_settings else 300
        active_counters = queue_settings.active_counters if queue_settings and queue_settings.active_counters > 0 else 1

        try:
            position_index = [t.id for t in all_waiting].index(token.id)
            token.estimated_wait_seconds = int((position_index / active_counters) * avg_service_time)
        except ValueError:
            pass # Shouldn't happen if status is WAITING
            
    return token
