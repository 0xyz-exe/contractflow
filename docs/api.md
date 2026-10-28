# API Reference Documentation

All endpoints are prefixed with `/api/v1` and require `Authorization: Bearer <token>` unless otherwise specified.

## Authentication
- `POST /auth/login`: Authenticate with email and password to receive JWT.
- `GET /auth/me`: Fetch current authenticated profile and organization context.

## Contracts
- `GET /contracts/`: List contracts with filtering by stage, department, and search term.
- `POST /contracts/`: Create new contract draft and generate reference `CTR-YYYY-XXXXXX`.
- `GET /contracts/{id}`: Detailed contract view with document versions, approvals, and obligations.
- `PATCH /contracts/{id}`: Update metadata.
- `POST /contracts/{id}/submit`: Submit draft to approval routing.
- `POST /contracts/{id}/activate`: Transition signed contract to Active.
- `POST /contracts/{id}/documents`: Upload new document version (SHA-256 stamped).
- `GET /contracts/{id}/documents/{doc_id}/download`: Download document.
- `POST /contracts/{id}/comments`: Post review note.

## Approvals
- `GET /approvals/`: List pending or historical approval tasks.
- `POST /approvals/{task_id}/decision`: Execute `APPROVE`, `REJECT`, or `REQUEST_CHANGES` with mandatory rationale.

## Templates & Clauses
- `GET /templates/`: Pre-approved boilerplate contracts.
- `GET /templates/clauses`: Reusable standard clauses with risk ratings.

## Obligations
- `GET /obligations/`: List upcoming and overdue obligations.
- `PATCH /obligations/{id}`: Update status (e.g. `COMPLETED`).

## Dashboard & Compliance
- `GET /dashboard/metrics`: Portfolio valuation and turnaround metrics.
- `GET /dashboard/audit`: Append-only audit events log.
- `GET /dashboard/export/contracts.csv`: Stream CSV export of authorized contracts.
