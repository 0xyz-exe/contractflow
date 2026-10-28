import json
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import AuditEvent, Notification, Contract, User
from app.services.email import send_notification_email

def log_audit_event(
    db: Session,
    organization_id: int,
    actor_id: int | None,
    actor_name: str,
    event_type: str,
    resource_type: str,
    resource_id: str,
    metadata: dict | None = None
) -> AuditEvent:
    event = AuditEvent(
        organization_id=organization_id,
        actor_id=actor_id,
        actor_name=actor_name,
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata_json=json.dumps(metadata) if metadata else None,
        created_at=datetime.utcnow()
    )
    db.add(event)
    db.commit()
    return event

def create_notification(
    db: Session,
    user_id: int,
    organization_id: int,
    title: str,
    message: str,
    link_url: str | None = None
) -> Notification:
    notif = Notification(
        user_id=user_id,
        organization_id=organization_id,
        title=title,
        message=message,
        link_url=link_url,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notif)
    db.commit()

    # Optional external email dispatch
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.email:
        send_notification_email(
            recipient_email=user.email,
            subject=title,
            message_text=message,
            link_url=link_url
        )

    return notif

def generate_contract_ref(db: Session, organization_id: int) -> str:
    year = datetime.utcnow().year
    count = db.query(func.count(Contract.id)).filter(
        Contract.organization_id == organization_id
    ).scalar() or 0
    ref_num = count + 1
    return f"CTR-{year}-{ref_num:06d}"
