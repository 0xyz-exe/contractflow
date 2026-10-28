import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_login_success():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "admin@contractflow.org"
    assert data["user"]["role"] == "OWNER"

def test_auth_login_invalid_password():
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401

def test_contract_list_authenticated():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/contracts/", headers=headers)
    assert res.status_code == 200
    contracts = res.json()
    assert len(contracts) >= 6
    assert any(c["contract_ref"] == "CTR-2026-000001" for c in contracts)

def test_contract_creation_and_reference_generation():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    new_contract = {
        "title": "Quantum Compute Cluster Licensing Agreement",
        "counterparty_name": "Rigetti Computing Corp",
        "counterparty_contact": "commercial@rigetti.com",
        "department": "Engineering",
        "estimated_value": 75000.0,
        "currency": "USD",
        "renewal_type": "Manual",
        "renewal_reminder_days": 30,
        "confidentiality": "Highly Confidential",
        "description": "Multi-year QPUs access reservation."
    }
    create_res = client.post("/api/v1/contracts/", json=new_contract, headers=headers)
    assert create_res.status_code == 201
    contract = create_res.json()
    assert contract["contract_ref"].startswith("CTR-")
    assert contract["lifecycle_stage"] == "DRAFT"

def test_submit_approval_workflow():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create draft
    new_contract = {
        "title": "Automated Logistics Fleet Telemetry SOW",
        "counterparty_name": "Trimble Navigation Inc",
        "department": "Operations",
        "estimated_value": 35000.0,
        "currency": "USD"
    }
    create_res = client.post("/api/v1/contracts/", json=new_contract, headers=headers)
    cid = create_res.json()["id"]

    # Submit for approval
    submit_res = client.post(f"/api/v1/contracts/{cid}/submit", headers=headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["tasks_count"] >= 3

def test_approval_decision_requires_rationale():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch pending tasks
    tasks_res = client.get("/api/v1/approvals/?status_filter=PENDING", headers=headers)
    assert tasks_res.status_code == 200
    tasks = tasks_res.json()
    if tasks:
        task_id = tasks[0]["id"]
        # Try rejecting with empty rationale
        bad_decision = client.post(f"/api/v1/approvals/{task_id}/decision", json={
            "action": "REJECT",
            "rationale": "a" # Less than 3 chars
        }, headers=headers)
        assert bad_decision.status_code == 422

def test_templates_and_clauses_listing():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    t_res = client.get("/api/v1/templates/", headers=headers)
    assert t_res.status_code == 200
    assert len(t_res.json()) >= 10

    c_res = client.get("/api/v1/templates/clauses", headers=headers)
    assert c_res.status_code == 200
    assert len(c_res.json()) >= 6

def test_dashboard_metrics_and_csv_export():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@contractflow.org",
        "password": "AdminPass123!"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    metrics_res = client.get("/api/v1/dashboard/metrics", headers=headers)
    assert metrics_res.status_code == 200
    metrics = metrics_res.json()
    assert metrics["total_contracts"] >= 6
    assert metrics["total_portfolio_value"] > 0

    csv_res = client.get("/api/v1/dashboard/export/contracts.csv", headers=headers)
    assert csv_res.status_code == 200
    assert "text/csv" in csv_res.headers["content-type"]
    assert "Reference,Title" in csv_res.text

def test_background_jobs_and_idempotency():
    from app.database import SessionLocal
    from app.services.jobs import process_expiration_and_obligations
    db = SessionLocal()
    try:
        # First execution
        res1 = process_expiration_and_obligations(db)
        assert isinstance(res1, dict)
        # Second execution: idempotency verification (should not duplicate notifications)
        res2 = process_expiration_and_obligations(db)
        assert res2["expiring_warnings"] == 0
    finally:
        db.close()

