# Security Architecture & Controls

ContractFlow enforces defense-in-depth across the application and data layers.

## Implemented Security Controls

### 1. Multi-Tenant Data Isolation
- Every table includes an `organization_id` foreign key.
- All query operations in `app/routers/` explicitly filter by `current_user.organization_id`.
- Attempts to query or mutate an entity belonging to another organization return `404 Not Found` or `403 Forbidden`.

### 2. Role-Based Access Control (RBAC)
- Strict segregation of permissions across roles:
  - `OWNER` / `ADMIN`: Full organizational management, policy configuration.
  - `LEGAL_COUNSEL`: Draft revisions, legal reviews, clause template management.
  - `DEPT_MANAGER`: Departmental approvals up to delegated limits.
  - `FINANCE`: Budget validation and commercial review.
  - `REQUESTER`: Contract drafting and tracking.
  - `AUDITOR`: Read-only access to audit trail and compliance history.

### 3. Conflict of Interest Enforcement
- Requesters are blocked at the business logic layer from approving their own contract requests.

### 4. Cryptographic Integrity
- Every uploaded document version is hashed with `SHA-256`.
- Download links verify user identity and organization tenancy before streaming bytes.

### 5. Input Validation & Parameterized Queries
- Pydantic v2 schemas validate all incoming JSON payloads.
- SQLAlchemy 2.0 ORM uses parameterized SQL queries, eliminating SQL injection risks.
