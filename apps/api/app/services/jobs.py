import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.models import (
    Contract, ContractLifecycleStage, ContractObligation, ObligationStatus,
    Notification, AuditEvent
)
from app.services.audit import log_audit_event, create_notification

logger = logging.getLogger("contractflow.jobs")

def process_expiration_and_obligations(db: Session) -> dict:
    """
    Idempotent background job:
    1. Detects contracts approaching expiration (<30 days notice).
    2. Flags expired contracts past their end_date.
    3. Detects and transitions overdue obligations.
    Deduplicates notifications to prevent spamming.
    """
    now = datetime.utcnow()
    expiring_threshold = now + timedelta(days=30)
    
    results = {
        "expiring_warnings": 0,
        "contracts_expired": 0,
        "obligations_overdue": 0
    }

    # 1. Approaching expiration warnings
    active_contracts = db.query(Contract).filter(
        Contract.lifecycle_stage == ContractLifecycleStage.ACTIVE,
        Contract.end_date != None,
        Contract.end_date <= expiring_threshold,
        Contract.end_date >= now
    ).all()

    for contract in active_contracts:
        # Idempotency check: verify notification not already sent within last 7 days
        recent_notif = db.query(Notification).filter(
            Notification.user_id == contract.owner_id,
            Notification.title.ilike(f"%Approaching Expiration: {contract.contract_ref}%"),
            Notification.created_at >= now - timedelta(days=7)
        ).first()

        if not recent_notif:
            create_notification(
                db=db,
                user_id=contract.owner_id,
                organization_id=contract.organization_id,
                title=f"Approaching Expiration: {contract.contract_ref}",
                message=f"Contract '{contract.title}' with {contract.counterparty_name} expires on {contract.end_date.strftime('%Y-%m-%d')}. Review renewal terms.",
                link_url=f"/contracts/{contract.id}"
            )
            log_audit_event(
                db=db,
                organization_id=contract.organization_id,
                actor_id=None,
                actor_name="BackgroundJobEngine",
                event_type="EXPIRATION_WARNING_EMITTED",
                resource_type="Contract",
                resource_id=contract.contract_ref,
                metadata={"end_date": contract.end_date.isoformat()}
            )
            results["expiring_warnings"] += 1

    # 2. Transition past-due contracts to EXPIRED
    overdue_contracts = db.query(Contract).filter(
        Contract.lifecycle_stage == ContractLifecycleStage.ACTIVE,
        Contract.end_date != None,
        Contract.end_date < now
    ).all()

    for contract in overdue_contracts:
        contract.lifecycle_stage = ContractLifecycleStage.EXPIRED
        contract.updated_at = now
        create_notification(
            db=db,
            user_id=contract.owner_id,
            organization_id=contract.organization_id,
            title=f"Contract Expired: {contract.contract_ref}",
            message=f"Contract '{contract.title}' has expired as of {contract.end_date.strftime('%Y-%m-%d')}.",
            link_url=f"/contracts/{contract.id}"
        )
        log_audit_event(
            db=db,
            organization_id=contract.organization_id,
            actor_id=None,
            actor_name="BackgroundJobEngine",
            event_type="CONTRACT_EXPIRED",
            resource_type="Contract",
            resource_id=contract.contract_ref
        )
        results["contracts_expired"] += 1

    # 3. Transition overdue obligations
    overdue_obls = db.query(ContractObligation).filter(
        ContractObligation.status == ObligationStatus.PENDING,
        ContractObligation.due_date < now
    ).all()

    for obl in overdue_obls:
        obl.status = ObligationStatus.OVERDUE
        contract = db.query(Contract).filter(Contract.id == obl.contract_id).first()
        if contract:
            create_notification(
                db=db,
                user_id=contract.owner_id,
                organization_id=contract.organization_id,
                title=f"Obligation Overdue: {obl.title}",
                message=f"Milestone '{obl.title}' for {contract.contract_ref} passed deadline {obl.due_date.strftime('%Y-%m-%d')}.",
                link_url=f"/contracts/{contract.id}"
            )
        results["obligations_overdue"] += 1

    db.commit()
    return results

if __name__ == "__main__":
    db = SessionLocal()
    try:
        res = process_expiration_and_obligations(db)
        print(f"Background jobs processed: {res}")
    finally:
        db.close()
