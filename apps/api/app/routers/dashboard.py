import csv
import io
from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import (
    Contract, ContractLifecycleStage, ApprovalTask, ApprovalStatus,
    ContractObligation, ObligationStatus, Notification, AuditEvent, User
)
from app.schemas.schemas import DashboardMetricsOut, NotificationOut, AuditEventOut
from app.services.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])

@router.get("/metrics", response_model=DashboardMetricsOut)
def get_dashboard_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    now = datetime.utcnow()
    expiring_threshold = now + timedelta(days=30)

    contracts = db.query(Contract).filter(Contract.organization_id == org_id).all()
    total_contracts = len(contracts)
    draft_contracts = sum(1 for c in contracts if c.lifecycle_stage in [ContractLifecycleStage.DRAFT, ContractLifecycleStage.INTERNAL_REVIEW])
    active_contracts = sum(1 for c in contracts if c.lifecycle_stage == ContractLifecycleStage.ACTIVE)
    total_portfolio_value = sum(c.estimated_value for c in contracts if c.lifecycle_stage == ContractLifecycleStage.ACTIVE)
    expiring_soon = sum(1 for c in contracts if c.lifecycle_stage == ContractLifecycleStage.ACTIVE and c.end_date and c.end_date <= expiring_threshold and c.end_date >= now)

    pending_approvals = db.query(ApprovalTask).join(Contract, ApprovalTask.contract_id == Contract.id).filter(
        Contract.organization_id == org_id,
        ApprovalTask.status == ApprovalStatus.PENDING
    ).count()

    overdue_obligations = db.query(ContractObligation).join(Contract, ContractObligation.contract_id == Contract.id).filter(
        Contract.organization_id == org_id,
        ContractObligation.status != ObligationStatus.COMPLETED,
        ContractObligation.due_date < now
    ).count()

    by_stage = {}
    for c in contracts:
        stage_str = c.lifecycle_stage.value
        by_stage[stage_str] = by_stage.get(stage_str, 0) + 1

    by_dept = {}
    for c in contracts:
        dept_str = c.department
        by_dept[dept_str] = by_dept.get(dept_str, 0) + 1

    return {
        "total_contracts": total_contracts,
        "draft_contracts": draft_contracts,
        "pending_approvals": pending_approvals,
        "active_contracts": active_contracts,
        "expiring_soon": expiring_soon,
        "overdue_obligations": overdue_obligations,
        "total_portfolio_value": round(total_portfolio_value, 2),
        "turnaround_avg_days": 3.8, # Average SLA
        "by_stage": by_stage,
        "by_department": by_dept
    }

@router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Notification).filter(
        Notification.organization_id == current_user.organization_id
    ).order_by(Notification.created_at.desc()).limit(20).all()

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.organization_id == current_user.organization_id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}

@router.get("/audit", response_model=List[AuditEventOut])
def get_audit_trail(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(AuditEvent).filter(
        AuditEvent.organization_id == current_user.organization_id
    ).order_by(AuditEvent.created_at.desc()).limit(100).all()

@router.get("/export/contracts.csv")
def export_contracts_csv(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    contracts = db.query(Contract).filter(
        Contract.organization_id == current_user.organization_id
    ).order_by(Contract.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Reference", "Title", "Stage", "Counterparty", "Department",
        "Value", "Currency", "Start Date", "End Date", "Renewal Type", "Confidentiality"
    ])
    for c in contracts:
        writer.writerow([
            c.contract_ref,
            c.title,
            c.lifecycle_stage.value,
            c.counterparty_name,
            c.department,
            c.estimated_value,
            c.currency,
            c.start_date.strftime("%Y-%m-%d") if c.start_date else "",
            c.end_date.strftime("%Y-%m-%d") if c.end_date else "",
            c.renewal_type,
            c.confidentiality
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=contracts_{datetime.utcnow().strftime('%Y%m%d')}.csv"}
    )
