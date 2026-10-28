import os
import sys
from datetime import datetime, timedelta

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
from app.models.models import (
    Organization, User, UserRole, ContractCategory, Contract,
    ContractLifecycleStage, ContractDocument, ApprovalTask, ApprovalStatus,
    ContractTemplate, ContractClause, ClauseRisk, ContractObligation,
    ObligationPriority, ObligationStatus, ContractComment, Notification, AuditEvent
)
from app.services.auth import get_password_hash

def run_seed():
    print("Re-creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("Seeding organization...")
        org = Organization(
            name="Global Logistics & Cloud Corp",
            slug="global-logistics",
            created_at=datetime.utcnow() - timedelta(days=60)
        )
        db.add(org)
        db.flush()

        print("Seeding enterprise users with roles...")
        users_data = [
            ("admin@contractflow.org", "AdminPass123!", "Alex Vance", UserRole.OWNER, "Executive"),
            ("legal@contractflow.org", "LegalPass123!", "Eleanor Hayes, Esq.", UserRole.LEGAL_COUNSEL, "Legal"),
            ("manager@contractflow.org", "ManagerPass123!", "Marcus Sterling", UserRole.DEPT_MANAGER, "Operations"),
            ("finance@contractflow.org", "FinancePass123!", "Sophia Chen, CPA", UserRole.FINANCE, "Finance"),
            ("requester@contractflow.org", "RequestPass123!", "David Kim", UserRole.REQUESTER, "Engineering"),
            ("auditor@contractflow.org", "AuditPass123!", "Rachel Green", UserRole.AUDITOR, "Compliance")
        ]
        
        users_map = {}
        for email, pwd, name, role, dept in users_data:
            u = User(
                organization_id=org.id,
                email=email,
                full_name=name,
                hashed_password=get_password_hash(pwd),
                role=role,
                department=dept,
                is_active=True,
                created_at=datetime.utcnow() - timedelta(days=50)
            )
            db.add(u)
            db.flush()
            users_map[role] = u

        print("Seeding contract categories...")
        categories_data = [
            ("Non-Disclosure Agreement", "NDA", "Mutual and unilateral proprietary confidentiality covenants"),
            ("Master Services Agreement", "MSA", "Governing framework for multi-project professional services"),
            ("Statement of Work", "SOW", "Project-specific deliverables, milestones, and payment schedule"),
            ("Software License & SaaS", "SaaS", "Enterprise software subscriptions, cloud platforms, and SLAs"),
            ("Vendor & Procurement", "VEND", "Supply chain, raw materials, logistics, and facilities agreements")
        ]
        cats = {}
        for name, code, desc in categories_data:
            c = ContractCategory(organization_id=org.id, name=name, code=code, description=desc)
            db.add(c)
            db.flush()
            cats[code] = c

        print("Seeding Contract Templates (10 standard contracts)...")
        templates_data = [
            ("Mutual Non-Disclosure Agreement", "NDA", "Standard bilateral agreement protecting proprietary information and trade secrets prior to commercial negotiations."),
            ("Master Services Agreement (MSA)", "MSA", "Comprehensive master agreement outlining liability, warranties, IP ownership, and dispute resolution for vendors."),
            ("Statement of Work (SOW)", "SOW", "Detailed project scope document defining phases, deliverables, acceptance criteria, and milestone billings."),
            ("Enterprise SaaS Subscription Agreement", "SaaS", "Cloud software license, data privacy stipulations, SLA uptime guarantees, and seat allocation."),
            ("Independent Contractor & Consulting Agreement", "SOW", "Engagement terms for specialized outside advisors, clarifying non-employee status and IP assignment."),
            ("Data Processing Agreement (GDPR/CCPA DPA)", "NDA", "Mandatory compliance schedule governing sub-processors, security measures, and breach notifications."),
            ("Software License & Support Agreement", "SaaS", "On-premise or hybrid software deployment rights, maintenance windows, and technical support tiers."),
            ("Commercial Vendor & Supply Framework", "VEND", "Wholesale inventory supply terms, quality control inspection clauses, and logistics freight terms."),
            ("Executive Employment & Non-Compete Agreement", "MSA", "Standard employment covenant including severance, restrictive covenants, and invention assignment."),
            ("Strategic Joint Venture & Partnership Agreement", "MSA", "Collaboration agreement establishing governance council, revenue sharing, and cross-licensing.")
        ]
        for title, cat_code, desc in templates_data:
            tmpl = ContractTemplate(
                organization_id=org.id,
                title=title,
                category=cat_code,
                description=desc,
                version="1.0.0",
                content_markdown=f"# {title}\n\n## 1. PARTIES & RECITALS\nThis Agreement is entered into by and between Company and Counterparty...\n\n## 2. COVENANTS & SCOPE\nThe parties agree to adhere to strict performance standards.\n\n## 3. GOVERNING LAW\nGoverned by the laws of Delaware.",
                is_published=True
            )
            db.add(tmpl)

        print("Seeding Clause Library...")
        clauses_data = [
            ("Limitation of Liability (1x Annual Cap)", "Liability", "IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL FEES PAID OR PAYABLE HEREUNDER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.", ClauseRisk.LOW),
            ("Mutual Confidentiality & Trade Secrets Preservation", "Confidentiality", "Each party agrees to safeguard the other party's Confidential Information with at least the same degree of care it uses for its own confidential data, but not less than reasonable care.", ClauseRisk.LOW),
            ("Delaware Governing Law & AAA Arbitration", "Dispute Resolution", "This Agreement shall be governed and construed in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles. Disputes resolved via AAA expedited rules.", ClauseRisk.LOW),
            ("Termination for Convenience (30-Day Notice)", "Termination", "Either party may terminate this Agreement or any Statement of Work without cause upon thirty (30) days prior written notice to the other party.", ClauseRisk.MEDIUM),
            ("Work Made for Hire & IP Assignment", "Intellectual Property", "All deliverables, inventions, discoveries, and work product developed by Contractor hereunder shall be deemed work made for hire and exclusive property of Company.", ClauseRisk.LOW),
            ("Unlimited Indemnification for IP Infringement", "Indemnity", "Vendor agrees to defend, indemnify, and hold harmless Customer from any damages, legal fees, or settlements resulting from third-party IP infringement claims.", ClauseRisk.HIGH)
        ]
        for title, cat, text, risk in clauses_data:
            cl = ContractClause(
                organization_id=org.id,
                title=title,
                category=cat,
                clause_text=text,
                version="1.0",
                risk_level=risk,
                is_approved=True
            )
            db.add(cl)

        print("Seeding Contracts & Lifecycle States...")
        contracts_specs = [
            {
                "ref": "CTR-2026-000001",
                "title": "Enterprise Cloud Infrastructure Master Agreement",
                "cat": cats["SaaS"],
                "stage": ContractLifecycleStage.ACTIVE,
                "counterparty": "Amazon Web Services Inc.",
                "dept": "Engineering",
                "value": 240000.0,
                "start": datetime.utcnow() - timedelta(days=90),
                "end": datetime.utcnow() + timedelta(days=275),
                "renewal": "Auto-renew (Annual)"
            },
            {
                "ref": "CTR-2026-000002",
                "title": "Global Ocean Freight & Port Handling Contract",
                "cat": cats["VEND"],
                "stage": ContractLifecycleStage.ACTIVE,
                "counterparty": "Maersk Line Logistics",
                "dept": "Operations",
                "value": 850000.0,
                "start": datetime.utcnow() - timedelta(days=120),
                "end": datetime.utcnow() + timedelta(days=20), # Expiring soon!
                "renewal": "Manual Review Required"
            },
            {
                "ref": "CTR-2026-000003",
                "title": "Strategic AI Copilot Development SOW",
                "cat": cats["SOW"],
                "stage": ContractLifecycleStage.APPROVAL,
                "counterparty": "Apex AI Solutions Inc.",
                "dept": "Engineering",
                "value": 65000.0,
                "start": datetime.utcnow() + timedelta(days=10),
                "end": datetime.utcnow() + timedelta(days=190),
                "renewal": "Non-renewable"
            },
            {
                "ref": "CTR-2026-000004",
                "title": "SOC2 Compliance & Penetration Testing Retainer",
                "cat": cats["MSA"],
                "stage": ContractLifecycleStage.INTERNAL_REVIEW,
                "counterparty": "Sentinel CyberGuard LLC",
                "dept": "Compliance",
                "value": 42000.0,
                "start": datetime.utcnow() + timedelta(days=15),
                "end": datetime.utcnow() + timedelta(days=380),
                "renewal": "Manual Review Required"
            },
            {
                "ref": "CTR-2026-000005",
                "title": "Reciprocal M&A Confidentiality Agreement",
                "cat": cats["NDA"],
                "stage": ContractLifecycleStage.DRAFT,
                "counterparty": "Horizon Capital Partners",
                "dept": "Executive",
                "value": 0.0,
                "start": datetime.utcnow() + timedelta(days=5),
                "end": datetime.utcnow() + timedelta(days=365),
                "renewal": "Non-renewable"
            },
            {
                "ref": "CTR-2026-000006",
                "title": "Warehouse Logistics Terminal Lease Extension",
                "cat": cats["VEND"],
                "stage": ContractLifecycleStage.RENEWAL,
                "counterparty": "Prologis Industrial Trust",
                "dept": "Operations",
                "value": 310000.0,
                "start": datetime.utcnow() - timedelta(days=350),
                "end": datetime.utcnow() + timedelta(days=15),
                "renewal": "Annual Extension"
            }
        ]

        created_contracts = []
        for cs in contracts_specs:
            c = Contract(
                organization_id=org.id,
                contract_ref=cs["ref"],
                title=cs["title"],
                category_id=cs["cat"].id,
                lifecycle_stage=cs["stage"],
                counterparty_name=cs["counterparty"],
                counterparty_contact=f"contracts@{cs['counterparty'].lower().replace(' ', '')[:10]}.com",
                department=cs["dept"],
                owner_id=users_map[UserRole.REQUESTER].id,
                estimated_value=cs["value"],
                currency="USD",
                start_date=cs["start"],
                end_date=cs["end"],
                renewal_type=cs["renewal"],
                renewal_reminder_days=30,
                confidentiality="Confidential & Proprietary",
                description=f"Enterprise agreement for {cs['title']} executed with {cs['counterparty']}.",
                current_version_num=1,
                created_at=datetime.utcnow() - timedelta(days=20),
                updated_at=datetime.utcnow() - timedelta(days=1)
            )
            db.add(c)
            db.flush()
            created_contracts.append(c)

            # Add dummy document
            doc = ContractDocument(
                contract_id=c.id,
                version_num=1,
                original_filename=f"{c.contract_ref}_executed.pdf",
                file_path=f"storage/org_{org.id}/{c.contract_ref}_v1.pdf",
                file_size=1024 * 340,
                mime_type="application/pdf",
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                uploaded_by_id=users_map[UserRole.REQUESTER].id,
                version_notes="Approved executed final version",
                created_at=datetime.utcnow() - timedelta(days=15)
            )
            db.add(doc)

        print("Seeding Approval Tasks...")
        # Assign approval tasks to CTR-2026-000003 (Apex AI SOW, $65k value -> Dept, Legal, Finance, Executive)
        ai_contract = created_contracts[2]
        tasks = [
            ApprovalTask(
                contract_id=ai_contract.id,
                stage_order=1,
                stage_name="Engineering Dept Manager Approval",
                assigned_role=UserRole.DEPT_MANAGER,
                assigned_user_id=users_map[UserRole.DEPT_MANAGER].id,
                status=ApprovalStatus.APPROVED,
                decision_rationale="Approved within FY2026 engineering technology budget allocations.",
                decision_version_num=1,
                decided_by_id=users_map[UserRole.DEPT_MANAGER].id,
                decided_at=datetime.utcnow() - timedelta(days=2),
                deadline=datetime.utcnow() + timedelta(days=1)
            ),
            ApprovalTask(
                contract_id=ai_contract.id,
                stage_order=2,
                stage_name="Legal Compliance & IP Rights Review",
                assigned_role=UserRole.LEGAL_COUNSEL,
                assigned_user_id=users_map[UserRole.LEGAL_COUNSEL].id,
                status=ApprovalStatus.PENDING,
                deadline=datetime.utcnow() + timedelta(days=3)
            ),
            ApprovalTask(
                contract_id=ai_contract.id,
                stage_order=3,
                stage_name="Finance Commercial & Milestone Payment Review",
                assigned_role=UserRole.FINANCE,
                assigned_user_id=users_map[UserRole.FINANCE].id,
                status=ApprovalStatus.PENDING,
                deadline=datetime.utcnow() + timedelta(days=5)
            ),
            ApprovalTask(
                contract_id=ai_contract.id,
                stage_order=4,
                stage_name="Executive Leadership Approval (Tier 4 > $50K)",
                assigned_role=UserRole.OWNER,
                assigned_user_id=users_map[UserRole.OWNER].id,
                status=ApprovalStatus.PENDING,
                deadline=datetime.utcnow() + timedelta(days=7)
            )
        ]
        db.add_all(tasks)

        print("Seeding Contract Obligations...")
        obligations = [
            ContractObligation(
                contract_id=created_contracts[0].id,
                title="Q4 SOC2 Type II Cloud Security Attestation",
                description="Obtain and review AWS SOC2 audit report for internal risk compliance.",
                responsible_name="Rachel Green",
                department="Compliance",
                due_date=datetime.utcnow() + timedelta(days=14),
                recurrence="Annual",
                priority=ObligationPriority.HIGH,
                status=ObligationStatus.PENDING
            ),
            ContractObligation(
                contract_id=created_contracts[0].id,
                title="Semi-Annual Reserved Instance Spend Reconciliation",
                description="Reconcile cloud committed spend against budget forecast.",
                responsible_name="Sophia Chen",
                department="Finance",
                due_date=datetime.utcnow() + timedelta(days=5),
                recurrence="Quarterly",
                priority=ObligationPriority.CRITICAL,
                status=ObligationStatus.PENDING
            ),
            ContractObligation(
                contract_id=created_contracts[1].id,
                title="Port Facility Hazmat Insurance Renewal Notice",
                description="Verify certificate of insurance coverage ($10M limit) from carrier.",
                responsible_name="Marcus Sterling",
                department="Operations",
                due_date=datetime.utcnow() - timedelta(days=4), # Overdue!
                recurrence="Annual",
                priority=ObligationPriority.HIGH,
                status=ObligationStatus.OVERDUE
            ),
            ContractObligation(
                contract_id=created_contracts[1].id,
                title="Monthly Port Container Turnaround SLA Report",
                description="Deliver shipping punctuality and demurrage log.",
                responsible_name="David Kim",
                department="Operations",
                due_date=datetime.utcnow() - timedelta(days=15),
                recurrence="Monthly",
                priority=ObligationPriority.MEDIUM,
                status=ObligationStatus.COMPLETED,
                completed_at=datetime.utcnow() - timedelta(days=16)
            )
        ]
        db.add_all(obligations)

        print("Seeding Comments & Audit Events...")
        comment = ContractComment(
            contract_id=ai_contract.id,
            author_id=users_map[UserRole.LEGAL_COUNSEL].id,
            author_name=users_map[UserRole.LEGAL_COUNSEL].full_name,
            comment_text="Clause 4.2 needs an explicit warranty of non-infringement for open-weight neural network model checkpoints.",
            clause_reference="Clause 4.2 IP Warranty",
            is_internal_only=True
        )
        db.add(comment)

        # Audit events
        audit1 = AuditEvent(
            organization_id=org.id,
            actor_id=users_map[UserRole.REQUESTER].id,
            actor_name=users_map[UserRole.REQUESTER].full_name,
            event_type="CONTRACT_CREATED",
            resource_type="Contract",
            resource_id="CTR-2026-000003",
            metadata_json='{"value": 65000.0, "counterparty": "Apex AI Solutions Inc."}',
            created_at=datetime.utcnow() - timedelta(days=3)
        )
        audit2 = AuditEvent(
            organization_id=org.id,
            actor_id=users_map[UserRole.DEPT_MANAGER].id,
            actor_name=users_map[UserRole.DEPT_MANAGER].full_name,
            event_type="APPROVAL_GRANTED",
            resource_type="ApprovalTask",
            resource_id="1",
            metadata_json='{"stage": "Engineering Dept Manager Approval"}',
            created_at=datetime.utcnow() - timedelta(days=2)
        )
        db.add_all([audit1, audit2])

        # Notifications
        notif1 = Notification(
            user_id=users_map[UserRole.LEGAL_COUNSEL].id,
            organization_id=org.id,
            title="Pending Approval Task",
            message="Contract CTR-2026-000003 (Apex AI SOW) requires your legal review.",
            link_url="/approvals"
        )
        notif2 = Notification(
            user_id=users_map[UserRole.REQUESTER].id,
            organization_id=org.id,
            title="Stage 1 Approved",
            message="Marcus Sterling approved stage 1 on CTR-2026-000003.",
            link_url="/contracts/3"
        )
        db.add_all([notif1, notif2])

        db.commit()
        print("Deterministic database seed completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
