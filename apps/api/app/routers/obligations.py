from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ContractObligation, Contract, ObligationStatus, User
from app.schemas.schemas import (
    ContractObligationCreate, ContractObligationUpdate, ContractObligationOut
)
from app.services.auth import get_current_user
from app.services.audit import log_audit_event

router = APIRouter(prefix="/obligations", tags=["Obligations"])

@router.get("/", response_model=List[ContractObligationOut])
def list_obligations(
    status_filter: Optional[ObligationStatus] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(ContractObligation).join(Contract, ContractObligation.contract_id == Contract.id).filter(
        Contract.organization_id == current_user.organization_id
    )
    if status_filter:
        query = query.filter(ContractObligation.status == status_filter)
    return query.order_by(ContractObligation.due_date.asc()).all()

@router.post("/contract/{contract_id}", response_model=ContractObligationOut)
def create_contract_obligation(
    contract_id: int,
    obl_in: ContractObligationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    obligation = ContractObligation(
        contract_id=contract.id,
        title=obl_in.title,
        description=obl_in.description,
        responsible_name=obl_in.responsible_name,
        department=obl_in.department,
        due_date=obl_in.due_date,
        recurrence=obl_in.recurrence,
        priority=obl_in.priority,
        status=ObligationStatus.PENDING,
        created_at=datetime.utcnow()
    )
    db.add(obligation)
    db.commit()
    db.refresh(obligation)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="OBLIGATION_CREATED",
        resource_type="ContractObligation",
        resource_id=str(obligation.id),
        metadata={"contract_ref": contract.contract_ref, "title": obligation.title}
    )

    return obligation

@router.patch("/{obligation_id}", response_model=ContractObligationOut)
def update_obligation(
    obligation_id: int,
    obl_update: ContractObligationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    obligation = db.query(ContractObligation).join(Contract, ContractObligation.contract_id == Contract.id).filter(
        ContractObligation.id == obligation_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not obligation:
        raise HTTPException(status_code=404, detail="Obligation not found")
    
    obligation.status = obl_update.status
    if obl_update.status == ObligationStatus.COMPLETED:
        obligation.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(obligation)
    return obligation
