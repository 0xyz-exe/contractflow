import os
import hashlib
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.config import settings
from app.database import get_db
from app.models.models import (
    Contract, ContractDocument, ContractComment, ContractCategory,
    ContractLifecycleStage, User, UserRole, ApprovalStatus
)
from app.schemas.schemas import (
    ContractCreate, ContractUpdate, ContractOut, ContractDetailOut,
    ContractDocumentOut, ContractCommentCreate, ContractCommentOut
)
from app.services.auth import get_current_user
from app.services.audit import log_audit_event, generate_contract_ref
from app.services.workflow import init_approval_workflow

router = APIRouter(prefix="/contracts", tags=["Contracts"])

@router.get("/", response_model=List[ContractOut])
def list_contracts(
    stage: Optional[ContractLifecycleStage] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Contract).filter(Contract.organization_id == current_user.organization_id)
    if stage:
        query = query.filter(Contract.lifecycle_stage == stage)
    if department:
        query = query.filter(Contract.department == department)
    if search:
        pattern = f"%{search}%"
        query = query.filter(
            or_(
                Contract.title.ilike(pattern),
                Contract.contract_ref.ilike(pattern),
                Contract.counterparty_name.ilike(pattern)
            )
        )
    return query.order_by(Contract.created_at.desc()).offset(skip).limit(limit).all()

@router.post("/", response_model=ContractOut, status_code=status.HTTP_201_CREATED)
def create_contract(
    contract_in: ContractCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ref = generate_contract_ref(db, current_user.organization_id)
    
    contract = Contract(
        organization_id=current_user.organization_id,
        contract_ref=ref,
        title=contract_in.title,
        category_id=contract_in.category_id,
        lifecycle_stage=ContractLifecycleStage.DRAFT,
        counterparty_name=contract_in.counterparty_name,
        counterparty_contact=contract_in.counterparty_contact,
        department=contract_in.department,
        owner_id=current_user.id,
        estimated_value=contract_in.estimated_value,
        currency=contract_in.currency,
        start_date=contract_in.start_date,
        end_date=contract_in.end_date,
        renewal_type=contract_in.renewal_type,
        renewal_reminder_days=contract_in.renewal_reminder_days,
        confidentiality=contract_in.confidentiality,
        description=contract_in.description,
        current_version_num=1,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(contract)
    db.commit()
    db.refresh(contract)

    # Automatically create initial placeholder draft document
    storage_dir = os.path.join(settings.STORAGE_DIR, f"org_{current_user.organization_id}")
    os.makedirs(storage_dir, exist_ok=True)
    doc_path = os.path.join(storage_dir, f"{ref}_v1.txt")
    initial_content = f"Draft Agreement: {contract.title}\nParties: {contract.counterparty_name}\nCreated: {datetime.utcnow().isoformat()}\nNotes: {contract_in.document_notes or 'Initial draft initialized.'}\n"
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(initial_content)
    
    checksum = hashlib.sha256(initial_content.encode("utf-8")).hexdigest()
    doc = ContractDocument(
        contract_id=contract.id,
        version_num=1,
        original_filename=f"{contract.title.lower().replace(' ', '_')}_draft_v1.txt",
        file_path=doc_path,
        file_size=len(initial_content),
        mime_type="text/plain",
        sha256_hash=checksum,
        uploaded_by_id=current_user.id,
        version_notes="Initial contract draft",
        created_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="CONTRACT_CREATED",
        resource_type="Contract",
        resource_id=ref,
        metadata={"title": contract.title, "value": contract.estimated_value, "counterparty": contract.counterparty_name}
    )

    return contract

@router.get("/{contract_id}", response_model=ContractDetailOut)
def get_contract_detail(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.patch("/{contract_id}", response_model=ContractOut)
def update_contract(
    contract_id: int,
    contract_update: ContractUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    update_data = contract_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(contract, field, val)
    
    contract.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(contract)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="CONTRACT_UPDATED",
        resource_type="Contract",
        resource_id=contract.contract_ref,
        metadata={"updated_fields": list(update_data.keys())}
    )

    return contract

@router.post("/{contract_id}/submit")
def submit_contract_for_approval(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    tasks = init_approval_workflow(db, contract, current_user)
    return {"message": "Contract submitted to approval routing", "tasks_count": len(tasks), "ref": contract.contract_ref}

@router.post("/{contract_id}/activate")
def activate_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    # Must be in SIGNATURE or APPROVAL (with all tasks completed)
    contract.lifecycle_stage = ContractLifecycleStage.ACTIVE
    contract.updated_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="CONTRACT_ACTIVATED",
        resource_type="Contract",
        resource_id=contract.contract_ref,
        metadata={"activated_by": current_user.email}
    )
    return {"message": "Contract activated successfully", "status": contract.lifecycle_stage}

@router.post("/{contract_id}/archive")
def archive_contract(
    contract_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    contract.lifecycle_stage = ContractLifecycleStage.ARCHIVED
    contract.updated_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="CONTRACT_ARCHIVED",
        resource_type="Contract",
        resource_id=contract.contract_ref
    )
    return {"message": "Contract archived", "status": contract.lifecycle_stage}

@router.post("/{contract_id}/documents", response_model=ContractDocumentOut)
async def upload_document_version(
    contract_id: int,
    file: UploadFile = File(...),
    version_notes: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    content = await file.read()
    if len(content) > 25 * 1024 * 1024: # 25MB limit
        raise HTTPException(status_code=400, detail="File size exceeds maximum 25MB limit")
    
    new_version = contract.current_version_num + 1
    checksum = hashlib.sha256(content).hexdigest()
    
    storage_dir = os.path.join(settings.STORAGE_DIR, f"org_{current_user.organization_id}")
    os.makedirs(storage_dir, exist_ok=True)
    safe_name = f"{contract.contract_ref}_v{new_version}_{os.path.basename(file.filename)}"
    file_path = os.path.join(storage_dir, safe_name)
    
    with open(file_path, "wb") as f:
        f.write(content)
    
    doc = ContractDocument(
        contract_id=contract.id,
        version_num=new_version,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=checksum,
        uploaded_by_id=current_user.id,
        version_notes=version_notes or f"Version {new_version} upload",
        created_at=datetime.utcnow()
    )
    db.add(doc)
    contract.current_version_num = new_version
    contract.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(doc)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="DOCUMENT_VERSION_UPLOADED",
        resource_type="ContractDocument",
        resource_id=str(doc.id),
        metadata={"contract_ref": contract.contract_ref, "version": new_version, "sha256": checksum}
    )

    return doc

@router.get("/{contract_id}/documents/{doc_id}/download")
def download_contract_document(
    contract_id: int,
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    doc = db.query(ContractDocument).filter(
        ContractDocument.id == doc_id,
        ContractDocument.contract_id == contract.id
    ).first()
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="Document file not found")
    
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.mime_type
    )

@router.post("/{contract_id}/comments", response_model=ContractCommentOut)
def add_contract_comment(
    contract_id: int,
    comment_in: ContractCommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contract = db.query(Contract).filter(
        Contract.id == contract_id,
        Contract.organization_id == current_user.organization_id
    ).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    comment = ContractComment(
        contract_id=contract.id,
        author_id=current_user.id,
        author_name=current_user.full_name,
        comment_text=comment_in.comment_text,
        clause_reference=comment_in.clause_reference,
        is_internal_only=comment_in.is_internal_only,
        is_resolved=False,
        created_at=datetime.utcnow()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    log_audit_event(
        db=db,
        organization_id=current_user.organization_id,
        actor_id=current_user.id,
        actor_name=current_user.full_name,
        event_type="COMMENT_ADDED",
        resource_type="ContractComment",
        resource_id=str(comment.id),
        metadata={"contract_ref": contract.contract_ref}
    )

    return comment
