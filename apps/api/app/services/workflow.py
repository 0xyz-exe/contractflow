from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import (
    Contract, ContractLifecycleStage, ApprovalTask, ApprovalStatus,
    User, UserRole
)
from app.services.audit import log_audit_event, create_notification

def init_approval_workflow(db: Session, contract: Contract, submitter: User) -> list[ApprovalTask]:
    """Generates multi-tier approval tasks based on value and department."""
    # Check if contract is eligible for submission
    if contract.lifecycle_stage not in [ContractLifecycleStage.DRAFT, ContractLifecycleStage.INTERNAL_REVIEW]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot submit contract in state {contract.lifecycle_stage}"
        )

    # Clean existing pending tasks if resubmitted
    db.query(ApprovalTask).filter(ApprovalTask.contract_id == contract.id).delete()

    tasks = []
    # Stage 1: Department Manager
    tasks.append(ApprovalTask(
        contract_id=contract.id,
        stage_order=1,
        stage_name=f"{contract.department} Manager Approval",
        assigned_role=UserRole.DEPT_MANAGER,
        status=ApprovalStatus.PENDING,
        deadline=datetime.utcnow() + timedelta(days=3)
    ))

    # Stage 2: Legal Counsel Review
    tasks.append(ApprovalTask(
        contract_id=contract.id,
        stage_order=2,
        stage_name="Legal Compliance & Risk Review",
        assigned_role=UserRole.LEGAL_COUNSEL,
        status=ApprovalStatus.PENDING,
        deadline=datetime.utcnow() + timedelta(days=5)
    ))

    # Stage 3: Finance Commercial Review (if estimated value > 10,000)
    if contract.estimated_value >= 10000:
        tasks.append(ApprovalTask(
            contract_id=contract.id,
            stage_order=3,
            stage_name="Finance & Budget Commitment Review",
            assigned_role=UserRole.FINANCE,
            status=ApprovalStatus.PENDING,
            deadline=datetime.utcnow() + timedelta(days=7)
        ))

    # Stage 4: Executive / Owner Approval (if estimated value >= 50,000)
    if contract.estimated_value >= 50000:
        tasks.append(ApprovalTask(
            contract_id=contract.id,
            stage_order=4,
            stage_name="Executive Leadership Approval",
            assigned_role=UserRole.OWNER,
            status=ApprovalStatus.PENDING,
            deadline=datetime.utcnow() + timedelta(days=10)
        ))

    db.add_all(tasks)
    contract.lifecycle_stage = ContractLifecycleStage.APPROVAL
    contract.updated_at = datetime.utcnow()
    db.commit()

    log_audit_event(
        db=db,
        organization_id=contract.organization_id,
        actor_id=submitter.id,
        actor_name=submitter.full_name,
        event_type="WORKFLOW_INITIATED",
        resource_type="Contract",
        resource_id=contract.contract_ref,
        metadata={"stages_count": len(tasks), "estimated_value": contract.estimated_value}
    )

    create_notification(
        db=db,
        user_id=contract.owner_id,
        organization_id=contract.organization_id,
        title="Approval Workflow Initiated",
        message=f"Contract {contract.contract_ref} has entered approval routing ({len(tasks)} stages).",
        link_url=f"/contracts/{contract.id}"
    )

    return tasks

def process_approval_decision(
    db: Session,
    task: ApprovalTask,
    action: str,
    rationale: str,
    decider: User
) -> ApprovalTask:
    contract = db.query(Contract).filter(Contract.id == task.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if decider.role != task.assigned_role and decider.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"User role {decider.role} is not authorized for task requiring {task.assigned_role}"
        )

    # Prevent self-approval if submitter is owner and not allowed
    if decider.id == contract.owner_id and decider.role != UserRole.OWNER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Conflict of interest: Requesters cannot approve their own contract submissions"
        )

    action_upper = action.upper()
    task.decision_rationale = rationale
    task.decided_by_id = decider.id
    task.decided_at = datetime.utcnow()
    task.decision_version_num = contract.current_version_num

    if action_upper == "APPROVE":
        task.status = ApprovalStatus.APPROVED
        # Check if all stages for this contract are now approved
        all_tasks = db.query(ApprovalTask).filter(ApprovalTask.contract_id == contract.id).order_by(ApprovalTask.stage_order).all()
        pending_remaining = [t for t in all_tasks if t.status == ApprovalStatus.PENDING and t.id != task.id]
        
        if not pending_remaining:
            # All stages completed! Advance contract to SIGNATURE or ACTIVE
            contract.lifecycle_stage = ContractLifecycleStage.SIGNATURE
            create_notification(
                db=db,
                user_id=contract.owner_id,
                organization_id=contract.organization_id,
                title="All Approvals Completed",
                message=f"Contract {contract.contract_ref} has received all approvals and is ready for signature.",
                link_url=f"/contracts/{contract.id}"
            )
        
        event_type = "APPROVAL_GRANTED"

    elif action_upper == "REJECT":
        task.status = ApprovalStatus.REJECTED
        contract.lifecycle_stage = ContractLifecycleStage.DRAFT
        event_type = "APPROVAL_REJECTED"
        create_notification(
            db=db,
            user_id=contract.owner_id,
            organization_id=contract.organization_id,
            title="Contract Rejected in Review",
            message=f"Contract {contract.contract_ref} was rejected at stage '{task.stage_name}'. Reason: {rationale}",
            link_url=f"/contracts/{contract.id}"
        )

    elif action_upper == "REQUEST_CHANGES":
        task.status = ApprovalStatus.CHANGES_REQUESTED
        contract.lifecycle_stage = ContractLifecycleStage.INTERNAL_REVIEW
        event_type = "CHANGES_REQUESTED"
        create_notification(
            db=db,
            user_id=contract.owner_id,
            organization_id=contract.organization_id,
            title="Revision Requested",
            message=f"Revisions requested on {contract.contract_ref} by {decider.full_name}: {rationale}",
            link_url=f"/contracts/{contract.id}"
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE, REJECT, or REQUEST_CHANGES")

    contract.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    log_audit_event(
        db=db,
        organization_id=contract.organization_id,
        actor_id=decider.id,
        actor_name=decider.full_name,
        event_type=event_type,
        resource_type="ApprovalTask",
        resource_id=str(task.id),
        metadata={"contract_ref": contract.contract_ref, "action": action_upper, "rationale": rationale}
    )

    return task
