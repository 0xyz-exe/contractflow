# Architecture Documentation

## Overview

ContractFlow is structured as a modular client-server web platform optimized for low latency, zero external cloud dependency for baseline operations, and strict tenant isolation.

```
┌────────────────────────────────────────────────────────┐
│                   Web Client (React 19)                │
│    Vite • Tailwind CSS v4 • Lucide • TypeScript        │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Bearer)
┌───────────────────────────▼────────────────────────────┐
│                  FastAPI Backend Engine                │
│   Routers • Services • Pydantic V2 • Workflow Machine  │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
   ┌──────────▼──────────┐      ┌──────────▼──────────┐
   │ SQLAlchemy ORM 2.0  │      │ Cryptographic Vault │
   │ PostgreSQL / SQLite │      │  SHA-256 File Store │
   └─────────────────────┘      └─────────────────────┘
```

## System Modules

1. **Authentication & Identity Service:**
   - Stateless HS256 JWT tokens.
   - Organization tenant scoping (`organization_id` on all entities).
   - Role-Based Access Control (`OWNER`, `ADMIN`, `LEGAL_COUNSEL`, `DEPT_MANAGER`, `REQUESTER`, `FINANCE`, `AUDITOR`).

2. **Contract Lifecycle State Machine:**
   - Valid lifecycle stages: `DRAFT` → `INTERNAL_REVIEW` → `APPROVAL` → `NEGOTIATION` → `SIGNATURE` → `ACTIVE` → `RENEWAL` / `EXPIRED` → `ARCHIVED`.
   - Thread-safe unique reference generation (`CTR-YYYY-XXXXXX`).

3. **Multi-Tier Approval Engine:**
   - Multi-stage sequential approval chains based on value thresholds.
   - Conflict-of-interest prevention: requesters cannot approve their own submissions.
   - Version-aware approvals: approval tasks reference the exact document version approved.
   - Mandatory decision rationale on approvals, rejections, and revision requests.

4. **Cryptographic Document Versioning:**
   - Immutable version records.
   - SHA-256 content checksum calculated on receipt.
   - Download endpoints enforce tenant authentication.

5. **Obligation & Compliance Tracking:**
   - Scheduled deliverable tracking (milestones, insurance renewals, SOC2 audits).
   - Overdue calculation based on UTC timestamps.

6. **Append-Only Audit Trail:**
   - Permanent records of every business event, actor, timestamp, and metadata payload.
