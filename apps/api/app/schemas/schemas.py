from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.models.models import (
    UserRole, ContractLifecycleStage, ApprovalStatus,
    ObligationPriority, ObligationStatus, ClauseRisk
)

# Auth
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    org_id: Optional[int] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.REQUESTER
    department: str = "Operations"
    organization_id: Optional[int] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: UserRole
    department: str
    organization_id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Category
class ContractCategoryOut(BaseModel):
    id: int
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# Documents
class ContractDocumentOut(BaseModel):
    id: int
    contract_id: int
    version_num: int
    original_filename: str
    file_path: str
    file_size: int
    mime_type: str
    sha256_hash: str
    uploaded_by_id: int
    version_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Approvals
class ApprovalTaskOut(BaseModel):
    id: int
    contract_id: int
    stage_order: int
    stage_name: str
    assigned_role: UserRole
    assigned_user_id: Optional[int] = None
    status: ApprovalStatus
    decision_rationale: Optional[str] = None
    decision_version_num: Optional[int] = None
    decided_by_id: Optional[int] = None
    decided_at: Optional[datetime] = None
    deadline: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalDecisionRequest(BaseModel):
    action: str = Field(..., description="APPROVE, REJECT, or REQUEST_CHANGES")
    rationale: str = Field(..., min_length=3, description="Mandatory decision reason")

# Obligations
class ContractObligationCreate(BaseModel):
    title: str
    description: Optional[str] = None
    responsible_name: str = "Team Lead"
    department: str = "Legal"
    due_date: datetime
    recurrence: str = "One-time"
    priority: ObligationPriority = ObligationPriority.MEDIUM

class ContractObligationUpdate(BaseModel):
    status: ObligationStatus
    completed_at: Optional[datetime] = None

class ContractObligationOut(BaseModel):
    id: int
    contract_id: int
    title: str
    description: Optional[str] = None
    responsible_name: str
    department: str
    due_date: datetime
    recurrence: str
    priority: ObligationPriority
    status: ObligationStatus
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Comments
class ContractCommentCreate(BaseModel):
    comment_text: str
    clause_reference: Optional[str] = None
    is_internal_only: bool = True

class ContractCommentOut(BaseModel):
    id: int
    contract_id: int
    author_id: int
    author_name: str
    comment_text: str
    clause_reference: Optional[str] = None
    is_internal_only: bool
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Contracts
class ContractCreate(BaseModel):
    title: str
    category_id: Optional[int] = None
    counterparty_name: str
    counterparty_contact: Optional[str] = None
    department: str = "Operations"
    estimated_value: float = 0.0
    currency: str = "USD"
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    renewal_type: str = "Manual"
    renewal_reminder_days: int = 30
    confidentiality: str = "Confidential"
    description: Optional[str] = None
    document_notes: Optional[str] = None

class ContractUpdate(BaseModel):
    title: Optional[str] = None
    counterparty_name: Optional[str] = None
    counterparty_contact: Optional[str] = None
    department: Optional[str] = None
    estimated_value: Optional[float] = None
    currency: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    renewal_type: Optional[str] = None
    renewal_reminder_days: Optional[int] = None
    confidentiality: Optional[str] = None
    description: Optional[str] = None
    lifecycle_stage: Optional[ContractLifecycleStage] = None

class ContractOut(BaseModel):
    id: int
    organization_id: int
    contract_ref: str
    title: str
    category_id: Optional[int] = None
    lifecycle_stage: ContractLifecycleStage
    counterparty_name: str
    counterparty_contact: Optional[str] = None
    department: str
    owner_id: int
    estimated_value: float
    currency: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    renewal_type: str
    renewal_reminder_days: int
    confidentiality: str
    description: Optional[str] = None
    current_version_num: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ContractDetailOut(ContractOut):
    documents: List[ContractDocumentOut] = []
    approval_tasks: List[ApprovalTaskOut] = []
    obligations: List[ContractObligationOut] = []
    comments: List[ContractCommentOut] = []

# Templates & Clauses
class ContractTemplateOut(BaseModel):
    id: int
    title: str
    category: str
    description: Optional[str] = None
    version: str
    content_markdown: str
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ContractClauseOut(BaseModel):
    id: int
    title: str
    category: str
    clause_text: str
    version: str
    risk_level: ClauseRisk
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Notifications
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    link_url: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Audit
class AuditEventOut(BaseModel):
    id: int
    organization_id: int
    actor_id: Optional[int] = None
    actor_name: str
    event_type: str
    resource_type: str
    resource_id: str
    metadata_json: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard
class DashboardMetricsOut(BaseModel):
    total_contracts: int
    draft_contracts: int
    pending_approvals: int
    active_contracts: int
    expiring_soon: int
    overdue_obligations: int
    total_portfolio_value: float
    turnaround_avg_days: float
    by_stage: dict
    by_department: dict
