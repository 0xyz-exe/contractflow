from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import ContractTemplate, ContractClause, User
from app.schemas.schemas import ContractTemplateOut, ContractClauseOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/templates", tags=["Templates & Clauses"])

@router.get("/", response_model=List[ContractTemplateOut])
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ContractTemplate).filter(
        ContractTemplate.organization_id == current_user.organization_id,
        ContractTemplate.is_published == True
    ).all()

@router.get("/clauses", response_model=List[ContractClauseOut])
def list_clauses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(ContractClause).filter(
        ContractClause.organization_id == current_user.organization_id,
        ContractClause.is_approved == True
    ).all()
