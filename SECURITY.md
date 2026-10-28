# Security Policy

ContractFlow takes the security of legal workflows and confidential contractual instruments seriously.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Security Controls Implemented

- **Tenant Isolation:** Multi-tenant organization boundaries enforced on all database queries.
- **Role-Based Access Control (RBAC):** Strict permissions on contract mutations, approvals, and legal clause changes.
- **Separation of Duties:** Requesters are prohibited from approving their own contract requests.
- **Cryptographic Document Stamping:** Every uploaded document is fingerprinted with a SHA-256 integrity hash.
- **Append-Only Audit Trail:** Tamper-evident logging of all lifecycle state transitions, decisions, and uploads.
- **Safe Password Hashing:** Direct bcrypt hashing with random salt.
- **JWT Authorization:** Standard stateless bearer token authentication with expiration enforcement.

## Reporting a Vulnerability

If you discover a security vulnerability in ContractFlow, please do NOT file a public issue.

Email security disclosures to: `security@contractflow.org` or open a private GitHub security advisory.
