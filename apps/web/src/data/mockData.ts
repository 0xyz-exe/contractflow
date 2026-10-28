import {
  Contract, ContractTemplate, ContractClause, DashboardMetrics,
  User, AuditEvent, ContractObligation, ApprovalTask
} from '../types';

export const mockCurrentUser: User = {
  id: 1,
  email: 'admin@contractflow.org',
  full_name: 'Alex Vance',
  role: 'OWNER',
  department: 'Executive',
  organization_id: 1,
  is_active: true,
  created_at: '2026-09-01T00:00:00Z'
};

export const mockMetrics: DashboardMetrics = {
  total_contracts: 6,
  draft_contracts: 2,
  pending_approvals: 3,
  active_contracts: 2,
  expiring_soon: 2,
  overdue_obligations: 1,
  total_portfolio_value: 1090000,
  turnaround_avg_days: 3.8,
  by_stage: {
    'ACTIVE': 2,
    'APPROVAL': 1,
    'INTERNAL_REVIEW': 1,
    'DRAFT': 1,
    'RENEWAL': 1
  },
  by_department: {
    'Engineering': 2,
    'Operations': 2,
    'Compliance': 1,
    'Executive': 1
  }
};

export const mockContracts: Contract[] = [
  {
    id: 1,
    organization_id: 1,
    contract_ref: 'CTR-2026-000001',
    title: 'Enterprise Cloud Infrastructure Master Agreement',
    lifecycle_stage: 'ACTIVE',
    counterparty_name: 'Amazon Web Services Inc.',
    counterparty_contact: 'contracts@aws.amazon.com',
    department: 'Engineering',
    owner_id: 5,
    estimated_value: 240000,
    currency: 'USD',
    start_date: '2026-07-01',
    end_date: '2027-06-30',
    renewal_type: 'Auto-renew (Annual)',
    renewal_reminder_days: 30,
    confidentiality: 'Confidential & Proprietary',
    description: 'Enterprise multi-region cloud compute and storage reservation agreement with 99.99% uptime SLA.',
    current_version_num: 2,
    created_at: '2026-06-15T10:00:00Z',
    updated_at: '2026-07-01T14:30:00Z',
    documents: [
      {
        id: 1,
        contract_id: 1,
        version_num: 1,
        original_filename: 'AWS_Enterprise_Addendum_v1.pdf',
        file_path: 'storage/org_1/CTR-2026-000001_v1.pdf',
        file_size: 428000,
        mime_type: 'application/pdf',
        sha256_hash: '3a7b9e8471c2f9d8a5b2c7e4f1a6d9b8c3e5f2a1b4c7d9e8f1a2b3c4d5e6f7a8',
        uploaded_by_id: 5,
        version_notes: 'Initial drafted addendum for security review',
        created_at: '2026-06-15T10:00:00Z'
      },
      {
        id: 2,
        contract_id: 1,
        version_num: 2,
        original_filename: 'AWS_Enterprise_Master_Executed_v2.pdf',
        file_path: 'storage/org_1/CTR-2026-000001_v2.pdf',
        file_size: 512000,
        mime_type: 'application/pdf',
        sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploaded_by_id: 1,
        version_notes: 'Executed bilateral final signature copy',
        created_at: '2026-07-01T14:30:00Z'
      }
    ],
    approval_tasks: [
      {
        id: 101,
        contract_id: 1,
        stage_order: 1,
        stage_name: 'Engineering Dept Manager Approval',
        assigned_role: 'DEPT_MANAGER',
        status: 'APPROVED',
        decision_rationale: 'Approved within FY2026 engineering cloud allocation.',
        decided_at: '2026-06-20T11:00:00Z',
        created_at: '2026-06-15T10:00:00Z'
      },
      {
        id: 102,
        contract_id: 1,
        stage_order: 2,
        stage_name: 'Legal Compliance & Risk Review',
        assigned_role: 'LEGAL_COUNSEL',
        status: 'APPROVED',
        decision_rationale: 'Liability limits negotiated to 1x annual fee. Standard DPA incorporated.',
        decided_at: '2026-06-25T16:00:00Z',
        created_at: '2026-06-15T10:00:00Z'
      }
    ],
    obligations: [
      {
        id: 201,
        contract_id: 1,
        title: 'Q4 SOC2 Type II Cloud Security Attestation',
        responsible_name: 'Rachel Green',
        department: 'Compliance',
        due_date: '2026-11-15',
        recurrence: 'Annual',
        priority: 'HIGH',
        status: 'PENDING',
        created_at: '2026-07-01T14:30:00Z'
      },
      {
        id: 202,
        contract_id: 1,
        title: 'Semi-Annual Reserved Instance Spend Reconciliation',
        responsible_name: 'Sophia Chen',
        department: 'Finance',
        due_date: '2026-11-02',
        recurrence: 'Quarterly',
        priority: 'CRITICAL',
        status: 'PENDING',
        created_at: '2026-07-01T14:30:00Z'
      }
    ],
    comments: [
      {
        id: 301,
        contract_id: 1,
        author_id: 2,
        author_name: 'Eleanor Hayes, Esq.',
        comment_text: 'Confirmed that clause 8.3 permits encryption key rotation without downtime penalty.',
        clause_reference: 'Section 8.3 Security Covenants',
        is_internal_only: true,
        is_resolved: true,
        created_at: '2026-06-24T09:15:00Z'
      }
    ]
  },
  {
    id: 2,
    organization_id: 1,
    contract_ref: 'CTR-2026-000002',
    title: 'Global Ocean Freight & Port Handling Contract',
    lifecycle_stage: 'ACTIVE',
    counterparty_name: 'Maersk Line Logistics',
    counterparty_contact: 'global.accounts@maersk.com',
    department: 'Operations',
    owner_id: 5,
    estimated_value: 850000,
    currency: 'USD',
    start_date: '2025-11-01',
    end_date: '2026-11-17',
    renewal_type: 'Manual Review Required',
    renewal_reminder_days: 30,
    confidentiality: 'Confidential',
    description: 'Containerized freight transport across Pacific and Atlantic logistics lanes.',
    current_version_num: 1,
    created_at: '2025-10-10T08:00:00Z',
    updated_at: '2025-11-01T12:00:00Z',
    obligations: [
      {
        id: 203,
        contract_id: 2,
        title: 'Port Facility Hazmat Insurance Renewal Notice',
        responsible_name: 'Marcus Sterling',
        department: 'Operations',
        due_date: '2026-10-24',
        recurrence: 'Annual',
        priority: 'HIGH',
        status: 'OVERDUE',
        created_at: '2025-11-01T12:00:00Z'
      }
    ]
  },
  {
    id: 3,
    organization_id: 1,
    contract_ref: 'CTR-2026-000003',
    title: 'Strategic AI Copilot Development SOW',
    lifecycle_stage: 'APPROVAL',
    counterparty_name: 'Apex AI Solutions Inc.',
    counterparty_contact: 'contracts@apex-ai.io',
    department: 'Engineering',
    owner_id: 5,
    estimated_value: 65000,
    currency: 'USD',
    start_date: '2026-11-10',
    end_date: '2027-05-15',
    renewal_type: 'Non-renewable',
    renewal_reminder_days: 30,
    confidentiality: 'Strictly Confidential',
    description: 'Fine-tuned internal domain language model pipelines and agentic automation workflows.',
    current_version_num: 1,
    created_at: '2026-10-25T11:20:00Z',
    updated_at: '2026-10-26T15:00:00Z',
    approval_tasks: [
      {
        id: 103,
        contract_id: 3,
        stage_order: 1,
        stage_name: 'Engineering Dept Manager Approval',
        assigned_role: 'DEPT_MANAGER',
        status: 'APPROVED',
        decision_rationale: 'Approved within FY2026 engineering technology budget allocations.',
        decided_at: '2026-10-26T14:00:00Z',
        created_at: '2026-10-25T11:20:00Z'
      },
      {
        id: 104,
        contract_id: 3,
        stage_order: 2,
        stage_name: 'Legal Compliance & IP Rights Review',
        assigned_role: 'LEGAL_COUNSEL',
        status: 'PENDING',
        deadline: '2026-10-31T23:59:59Z',
        created_at: '2026-10-25T11:20:00Z'
      },
      {
        id: 105,
        contract_id: 3,
        stage_order: 3,
        stage_name: 'Finance Commercial & Milestone Payment Review',
        assigned_role: 'FINANCE',
        status: 'PENDING',
        deadline: '2026-11-02T23:59:59Z',
        created_at: '2026-10-25T11:20:00Z'
      },
      {
        id: 106,
        contract_id: 3,
        stage_order: 4,
        stage_name: 'Executive Leadership Approval (Tier 4 > $50K)',
        assigned_role: 'OWNER',
        status: 'PENDING',
        deadline: '2026-11-04T23:59:59Z',
        created_at: '2026-10-25T11:20:00Z'
      }
    ],
    comments: [
      {
        id: 302,
        contract_id: 3,
        author_id: 2,
        author_name: 'Eleanor Hayes, Esq.',
        comment_text: 'Clause 4.2 needs an explicit warranty of non-infringement for open-weight neural network model checkpoints.',
        clause_reference: 'Clause 4.2 IP Warranty',
        is_internal_only: true,
        is_resolved: false,
        created_at: '2026-10-26T16:45:00Z'
      }
    ]
  },
  {
    id: 4,
    organization_id: 1,
    contract_ref: 'CTR-2026-000004',
    title: 'SOC2 Compliance & Penetration Testing Retainer',
    lifecycle_stage: 'INTERNAL_REVIEW',
    counterparty_name: 'Sentinel CyberGuard LLC',
    counterparty_contact: 'engagements@sentinelcyber.com',
    department: 'Compliance',
    owner_id: 6,
    estimated_value: 42000,
    currency: 'USD',
    start_date: '2026-11-15',
    end_date: '2027-11-14',
    renewal_type: 'Manual Review Required',
    renewal_reminder_days: 30,
    confidentiality: 'Confidential',
    description: 'Annual independent SOC2 Type II audit, black-box penetration tests, and vulnerability assessments.',
    current_version_num: 1,
    created_at: '2026-10-27T09:00:00Z',
    updated_at: '2026-10-27T09:00:00Z'
  },
  {
    id: 5,
    organization_id: 1,
    contract_ref: 'CTR-2026-000005',
    title: 'Reciprocal M&A Confidentiality Agreement',
    lifecycle_stage: 'DRAFT',
    counterparty_name: 'Horizon Capital Partners',
    counterparty_contact: 'dealteam@horizoncap.com',
    department: 'Executive',
    owner_id: 1,
    estimated_value: 0,
    currency: 'USD',
    start_date: '2026-11-01',
    end_date: '2027-11-01',
    renewal_type: 'Non-renewable',
    renewal_reminder_days: 30,
    confidentiality: 'Strictly Confidential',
    description: 'Mutual preliminary discovery and financial data exchange NDA for strategic merger considerations.',
    current_version_num: 1,
    created_at: '2026-10-28T08:30:00Z',
    updated_at: '2026-10-28T08:30:00Z'
  },
  {
    id: 6,
    organization_id: 1,
    contract_ref: 'CTR-2026-000006',
    title: 'Warehouse Logistics Terminal Lease Extension',
    lifecycle_stage: 'RENEWAL',
    counterparty_name: 'Prologis Industrial Trust',
    counterparty_contact: 'leasing@prologis.com',
    department: 'Operations',
    owner_id: 3,
    estimated_value: 310000,
    currency: 'USD',
    start_date: '2025-11-15',
    end_date: '2026-11-12',
    renewal_type: 'Annual Extension',
    renewal_reminder_days: 60,
    confidentiality: 'Commercial',
    description: 'Lease extension for 120,000 sq ft cross-dock logistics warehouse in Oakland Terminal.',
    current_version_num: 1,
    created_at: '2025-10-15T10:00:00Z',
    updated_at: '2026-10-20T11:00:00Z'
  }
];

export const mockTemplates: ContractTemplate[] = [
  {
    id: 1,
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'NDA',
    description: 'Standard bilateral agreement protecting proprietary information, technical designs, and financial disclosures.',
    version: '2.1.0',
    content_markdown: '# MUTUAL NON-DISCLOSURE AGREEMENT...',
    is_published: true,
    created_at: '2026-01-10T00:00:00Z'
  },
  {
    id: 2,
    title: 'Master Services Agreement (MSA)',
    category: 'MSA',
    description: 'Comprehensive enterprise framework establishing standard commercial covenants, liability caps, and warranty standards.',
    version: '3.0.0',
    content_markdown: '# MASTER SERVICES AGREEMENT...',
    is_published: true,
    created_at: '2026-01-15T00:00:00Z'
  },
  {
    id: 3,
    title: 'Statement of Work (SOW)',
    category: 'SOW',
    description: 'Project-specific scope document detailing milestone deliverables, engineering acceptance criteria, and fee structures.',
    version: '1.4.0',
    content_markdown: '# STATEMENT OF WORK...',
    is_published: true,
    created_at: '2026-02-01T00:00:00Z'
  },
  {
    id: 4,
    title: 'Enterprise SaaS Subscription Agreement',
    category: 'SaaS',
    description: 'Subscription terms including 99.9% uptime SLA commitments, data protection obligations, and tiered usage caps.',
    version: '2.0.0',
    content_markdown: '# ENTERPRISE SAAS SUBSCRIPTION AGREEMENT...',
    is_published: true,
    created_at: '2026-02-10T00:00:00Z'
  },
  {
    id: 5,
    title: 'Independent Contractor & Consulting Agreement',
    category: 'SOW',
    description: 'Outside advisory agreement establishing work-for-hire IP assignment and non-solicitation conditions.',
    version: '1.2.0',
    content_markdown: '# INDEPENDENT CONTRACTOR AGREEMENT...',
    is_published: true,
    created_at: '2026-02-20T00:00:00Z'
  },
  {
    id: 6,
    title: 'Data Processing Agreement (GDPR/CCPA DPA)',
    category: 'NDA',
    description: 'Mandatory privacy addendum governing sub-processor security standards and 72-hour breach disclosure protocols.',
    version: '2.2.0',
    content_markdown: '# DATA PROCESSING AGREEMENT...',
    is_published: true,
    created_at: '2026-03-01T00:00:00Z'
  },
  {
    id: 7,
    title: 'Software License & Support Agreement',
    category: 'SaaS',
    description: 'Hybrid software deployment terms, bug fix turnaround SLAs, and version maintenance schedules.',
    version: '1.1.0',
    content_markdown: '# SOFTWARE LICENSE & SUPPORT AGREEMENT...',
    is_published: true,
    created_at: '2026-03-15T00:00:00Z'
  },
  {
    id: 8,
    title: 'Commercial Vendor & Supply Framework',
    category: 'VEND',
    description: 'Supply chain inventory fulfillment, dock inspection acceptance rules, and FOB freight guidelines.',
    version: '1.0.0',
    content_markdown: '# COMMERCIAL VENDOR AGREEMENT...',
    is_published: true,
    created_at: '2026-04-01T00:00:00Z'
  },
  {
    id: 9,
    title: 'Executive Employment & Non-Compete Agreement',
    category: 'MSA',
    description: 'Leadership employment covenant covering equity vesting, severance packages, and trade secret protections.',
    version: '1.5.0',
    content_markdown: '# EXECUTIVE EMPLOYMENT AGREEMENT...',
    is_published: true,
    created_at: '2026-04-10T00:00:00Z'
  },
  {
    id: 10,
    title: 'Strategic Joint Venture & Partnership Agreement',
    category: 'MSA',
    description: 'Co-marketing and joint venture governance establishing oversight board, revenue attribution, and dissolution terms.',
    version: '1.0.0',
    content_markdown: '# STRATEGIC PARTNERSHIP AGREEMENT...',
    is_published: true,
    created_at: '2026-04-20T00:00:00Z'
  }
];

export const mockClauses: ContractClause[] = [
  {
    id: 1,
    title: 'Limitation of Liability (1x Annual Cap)',
    category: 'Liability',
    clause_text: "IN NO EVENT SHALL EITHER PARTY'S AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT EXCEED THE TOTAL FEES PAID OR PAYABLE HEREUNDER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.",
    version: '1.0',
    risk_level: 'LOW',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 2,
    title: 'Mutual Confidentiality & Trade Secrets Preservation',
    category: 'Confidentiality',
    clause_text: "Each party agrees to safeguard the other party's Confidential Information with at least the same degree of care it uses for its own confidential data, but not less than reasonable care.",
    version: '1.0',
    risk_level: 'LOW',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 3,
    title: 'Delaware Governing Law & AAA Arbitration',
    category: 'Dispute Resolution',
    clause_text: "This Agreement shall be governed and construed in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles. Disputes resolved via AAA expedited rules.",
    version: '1.0',
    risk_level: 'LOW',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 4,
    title: 'Termination for Convenience (30-Day Notice)',
    category: 'Termination',
    clause_text: "Either party may terminate this Agreement or any Statement of Work without cause upon thirty (30) days prior written notice to the other party.",
    version: '1.0',
    risk_level: 'MEDIUM',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 5,
    title: 'Work Made for Hire & IP Assignment',
    category: 'Intellectual Property',
    clause_text: "All deliverables, inventions, discoveries, and work product developed by Contractor hereunder shall be deemed work made for hire and exclusive property of Company.",
    version: '1.0',
    risk_level: 'LOW',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 6,
    title: 'Unlimited Indemnification for IP Infringement',
    category: 'Indemnity',
    clause_text: "Vendor agrees to defend, indemnify, and hold harmless Customer from any damages, legal fees, or settlements resulting from third-party IP infringement claims.",
    version: '1.0',
    risk_level: 'HIGH',
    is_approved: true,
    created_at: '2026-01-01T00:00:00Z'
  }
];

export const mockAuditEvents: AuditEvent[] = [
  {
    id: 1,
    organization_id: 1,
    actor_id: 5,
    actor_name: 'David Kim',
    event_type: 'CONTRACT_CREATED',
    resource_type: 'Contract',
    resource_id: 'CTR-2026-000003',
    metadata_json: '{"title": "Strategic AI Copilot Development SOW", "value": 65000.0, "counterparty": "Apex AI Solutions Inc."}',
    created_at: '2026-10-25T11:20:00Z'
  },
  {
    id: 2,
    organization_id: 1,
    actor_id: 3,
    actor_name: 'Marcus Sterling',
    event_type: 'APPROVAL_GRANTED',
    resource_type: 'ApprovalTask',
    resource_id: '103',
    metadata_json: '{"stage": "Engineering Dept Manager Approval", "rationale": "Approved within FY2026 engineering budget."}',
    created_at: '2026-10-26T14:00:00Z'
  },
  {
    id: 3,
    organization_id: 1,
    actor_id: 2,
    actor_name: 'Eleanor Hayes, Esq.',
    event_type: 'COMMENT_ADDED',
    resource_type: 'ContractComment',
    resource_id: '302',
    metadata_json: '{"contract_ref": "CTR-2026-000003", "clause": "Clause 4.2 IP Warranty"}',
    created_at: '2026-10-26T16:45:00Z'
  },
  {
    id: 4,
    organization_id: 1,
    actor_id: 1,
    actor_name: 'Alex Vance',
    event_type: 'CONTRACT_ACTIVATED',
    resource_type: 'Contract',
    resource_id: 'CTR-2026-000001',
    metadata_json: '{"value": 240000.0, "counterparty": "Amazon Web Services Inc."}',
    created_at: '2026-07-01T14:30:00Z'
  }
];
