from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import schemas

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.post("/login")
def login_admin(db: Session = Depends(get_db)):
    # TODO: Implement JWT authentication
    pass

@router.post("/token/{token_id}/next")
def call_next_token(token_id: str, db: Session = Depends(get_db)):
    # TODO: Implement mark token as CALLED
    pass

@router.post("/token/{token_id}/escalate")
def escalate_token(token_id: str, escalate_req: schemas.EscalateRequest, db: Session = Depends(get_db)):
    # TODO: Implement token escalation logic and audit logging
    pass
