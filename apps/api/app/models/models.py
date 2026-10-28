import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    LEGAL_COUNSEL = "LEGAL_COUNSEL"
    DEPT_MANAGER = "DEPT_MANAGER"
    REQUESTER = "REQUESTER"
    FINANCE = "FINANCE"
    AUDITOR = "AUDITOR"

class ContractLifecycleStage(str, enum.Enum):
    DRAFT = "DRAFT"
    INTERNAL_REVIEW = "INTERNAL_REVIEW"
    APPROVAL = "APPROVAL"
    NEGOTIATION = "NEGOTIATION"
    SIGNATURE = "SIGNATURE"
    ACTIVE = "ACTIVE"
    RENEWAL = "RENEWAL"
    EXPIRED = "EXPIRED"
    ARCHIVED = "ARCHIVED"

class ApprovalStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CHANGES_REQUESTED = "CHANGES_REQUESTED"

class ObligationPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ObligationStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    OVERDUE = "OVERDUE"

class ClauseRisk(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    users = relationship("User", back_populates="organization")
    contracts = relationship("Contract", back_populates="organization")
    categories = relationship("ContractCategory", back_populates="organization")
    templates = relationship("ContractTemplate", back_populates="organization")
    clauses = relationship("ContractClause", back_populates="organization")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.REQUESTER, nullable=False)
    department = Column(String(100), default="General", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="users")
    contracts = relationship("Contract", back_populates="owner")

class ContractCategory(Base):
    __tablename__ = "contract_categories"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(String(255), nullable=True)

    organization = relationship("Organization", back_populates="categories")
    contracts = relationship("Contract", back_populates="category")

class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    contract_ref = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category_id = Column(Integer, ForeignKey("contract_categories.id"), nullable=True)
    lifecycle_stage = Column(Enum(ContractLifecycleStage), default=ContractLifecycleStage.DRAFT, nullable=False, index=True)
    
    counterparty_name = Column(String(255), nullable=False)
    counterparty_contact = Column(String(255), nullable=True)
    department = Column(String(100), default="Operations", nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    estimated_value = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="USD", nullable=False)
    
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    renewal_type = Column(String(50), default="Manual", nullable=False) # Manual, Auto, Non-renewable
    renewal_reminder_days = Column(Integer, default=30, nullable=False)
    confidentiality = Column(String(50), default="Confidential", nullable=False)
    description = Column(Text, nullable=True)
    
    current_version_num = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="contracts")
    category = relationship("ContractCategory", back_populates="contracts")
    owner = relationship("User", back_populates="contracts")
    documents = relationship("ContractDocument", back_populates="contract", cascade="all, delete-orphan")
    approval_tasks = relationship("ApprovalTask", back_populates="contract", cascade="all, delete-orphan")
    obligations = relationship("ContractObligation", back_populates="contract", cascade="all, delete-orphan")
    comments = relationship("ContractComment", back_populates="contract", cascade="all, delete-orphan")

class ContractDocument(Base):
    __tablename__ = "contract_documents"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False, index=True)
    version_num = Column(Integer, nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    sha256_hash = Column(String(64), nullable=False)
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    version_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contract = relationship("Contract", back_populates="documents")

class ApprovalTask(Base):
    __tablename__ = "approval_tasks"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False, index=True)
    stage_order = Column(Integer, nullable=False)
    stage_name = Column(String(100), nullable=False)
    assigned_role = Column(Enum(UserRole), nullable=False)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    status = Column(Enum(ApprovalStatus), default=ApprovalStatus.PENDING, nullable=False)
    decision_rationale = Column(Text, nullable=True)
    decision_version_num = Column(Integer, nullable=True)
    decided_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contract = relationship("Contract", back_populates="approval_tasks")

class ContractTemplate(Base):
    __tablename__ = "contract_templates"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    version = Column(String(20), default="1.0.0", nullable=False)
    content_markdown = Column(Text, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="templates")

class ContractClause(Base):
    __tablename__ = "contract_clauses"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    clause_text = Column(Text, nullable=False)
    version = Column(String(20), default="1.0", nullable=False)
    risk_level = Column(Enum(ClauseRisk), default=ClauseRisk.LOW, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    organization = relationship("Organization", back_populates="clauses")

class ContractComment(Base):
    __tablename__ = "contract_comments"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False, index=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author_name = Column(String(255), nullable=False)
    comment_text = Column(Text, nullable=False)
    clause_reference = Column(String(100), nullable=True)
    is_internal_only = Column(Boolean, default=True, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contract = relationship("Contract", back_populates="comments")

class ContractObligation(Base):
    __tablename__ = "contract_obligations"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    responsible_owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    responsible_name = Column(String(255), default="Team Lead", nullable=False)
    department = Column(String(100), default="Legal", nullable=False)
    due_date = Column(DateTime, nullable=False)
    recurrence = Column(String(50), default="One-time", nullable=False) # One-time, Monthly, Quarterly, Annual
    priority = Column(Enum(ObligationPriority), default=ObligationPriority.MEDIUM, nullable=False)
    status = Column(Enum(ObligationStatus), default=ObligationStatus.PENDING, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    contract = relationship("Contract", back_populates="obligations")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link_url = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    organization_id = Column(Integer, ForeignKey("organizations.id"), nullable=False, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(255), default="System", nullable=False)
    event_type = Column(String(100), nullable=False, index=True) # e.g. CONTRACT_CREATED, STAGE_TRANSITION, APPROVED, REJECTED
    resource_type = Column(String(100), nullable=False) # e.g. Contract, ApprovalTask, Document
    resource_id = Column(String(100), nullable=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
