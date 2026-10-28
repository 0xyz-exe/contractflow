from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ApprovalTask, ApprovalStatus, Contract, User
from app.schemas.schemas import ApprovalTaskOut, ApprovalDecisionRequest
from app.services.auth import get_current_user
from app.services.workflow import process_approval_decision

router = APIRouter(prefix="/approvals", tags=["Approvals"])

@router.get("/", response_model=List[ApprovalTaskOut])
def list_approval_tasks(
    status_filter: Optional[ApprovalStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ApprovalTask).join(Contract, ApprovalTask.contract_id == Contract.id).filter(
        Contract.organization_id == current_user.organization_id
    )
    if status_filter:
        query = query.filter(ApprovalTask.status == status_filter)
    return query.order_by(ApprovalTask.created_at.desc()).all()

@router.post("/{task_id}/decision", response_model=ApprovalTaskOut)
def record_decision(
    task_id: int,
    decision_in: ApprovalDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(ApprovalTask).join(Contract, ApprovalTask.contract_id == Contract.id).filter(
        ApprovalTask.id == task_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Approval task not found")
    
    if task.status != ApprovalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Task is already in status {task.status}")

    return process_approval_decision(
        db=db,
        task=task,
        action=decision_in.action,
        rationale=decision_in.rationale,
        decider=current_user
    )
