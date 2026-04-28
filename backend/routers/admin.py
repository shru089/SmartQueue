from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas
import models

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/login")
def login_admin(db: Session = Depends(get_db)):
    return {"token": "dummy-token", "status": "success"}

@router.post("/queue/next")
def call_next_token(db: Session = Depends(get_db)):
    from routers.queue import get_sorted_waiting_tokens
    import datetime
    
    waiting = get_sorted_waiting_tokens(db)
    if not waiting:
        return {"message": "Queue is empty"}
        
    next_token = waiting[0]
    next_token.status = "CALLED"
    next_token.called_at = datetime.datetime.utcnow()
    
    # Update queue currently serving
    queue_state = db.query(models.Queue).first()
    if not queue_state:
        queue_state = models.Queue(name="City Medical Center", currently_serving=next_token.token_number)
        db.add(queue_state)
    else:
        queue_state.currently_serving = next_token.token_number
        
    db.commit()
    return {"message": "Called next token", "token": next_token.token_number}

@router.post("/token/{token_id}/escalate")
def escalate_token(token_id: str, escalate_req: schemas.EscalateRequest, db: Session = Depends(get_db)):
    token = db.query(models.Token).filter(models.Token.id == token_id).first()
    if token:
        token.priority = escalate_req.new_priority
        token.priority_reason = escalate_req.reason
        db.commit()
        return {"status": "success"}
    return {"status": "error"}

