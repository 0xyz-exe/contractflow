export type UserRole = 
  | 'OWNER' 
  | 'ADMIN' 
  | 'LEGAL_COUNSEL' 
  | 'DEPT_MANAGER' 
  | 'REQUESTER' 
  | 'FINANCE' 
  | 'AUDITOR';

export type ContractLifecycleStage = 
  | 'DRAFT' 
  | 'INTERNAL_REVIEW' 
  | 'APPROVAL' 
  | 'NEGOTIATION' 
  | 'SIGNATURE' 
  | 'ACTIVE' 
  | 'RENEWAL' 
  | 'EXPIRED' 
  | 'ARCHIVED';

export type ApprovalStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CHANGES_REQUESTED';

export type ObligationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ObligationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type ClauseRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  organization_id: number;
  is_active: boolean;
  created_at: string;
}

export interface ContractDocument {
  id: number;
  contract_id: number;
  version_num: number;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  sha256_hash: string;
  uploaded_by_id: number;
  version_notes?: string;
  created_at: string;
}

export interface ApprovalTask {
  id: number;
  contract_id: number;
  stage_order: number;
  stage_name: string;
  assigned_role: UserRole;
  assigned_user_id?: number;
  status: ApprovalStatus;
  decision_rationale?: string;
  decision_version_num?: number;
  decided_by_id?: number;
  decided_at?: string;
  deadline?: string;
  created_at: string;
}

export interface ContractObligation {
  id: number;
  contract_id: number;
  title: string;
  description?: string;
  responsible_name: string;
  department: string;
  due_date: string;
  recurrence: string;
  priority: ObligationPriority;
  status: ObligationStatus;
  completed_at?: string;
  created_at: string;
}

export interface ContractComment {
  id: number;
  contract_id: number;
  author_id: number;
  author_name: string;
  comment_text: string;
  clause_reference?: string;
  is_internal_only: boolean;
  is_resolved: boolean;
  created_at: string;
}

export interface Contract {
  id: number;
  organization_id: number;
  contract_ref: string;
  title: string;
  category_id?: number;
  lifecycle_stage: ContractLifecycleStage;
  counterparty_name: string;
  counterparty_contact?: string;
  department: string;
  owner_id: number;
  estimated_value: number;
  currency: string;
  start_date?: string;
  end_date?: string;
  renewal_type: string;
  renewal_reminder_days: number;
  confidentiality: string;
  description?: string;
  current_version_num: number;
  created_at: string;
  updated_at: string;
  documents?: ContractDocument[];
  approval_tasks?: ApprovalTask[];
  obligations?: ContractObligation[];
  comments?: ContractComment[];
}

export interface ContractTemplate {
  id: number;
  title: string;
  category: string;
  description?: string;
  version: string;
  content_markdown: string;
  is_published: boolean;
  created_at: string;
}

export interface ContractClause {
  id: number;
  title: string;
  category: string;
  clause_text: string;
  version: string;
  risk_level: ClauseRisk;
  is_approved: boolean;
  created_at: string;
}

export interface DashboardMetrics {
  total_contracts: number;
  draft_contracts: number;
  pending_approvals: number;
  active_contracts: number;
  expiring_soon: number;
  overdue_obligations: number;
  total_portfolio_value: number;
  turnaround_avg_days: number;
  by_stage: Record<string, number>;
  by_department: Record<string, number>;
}

export interface AuditEvent {
  id: number;
  organization_id: number;
  actor_id?: number;
  actor_name: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  metadata_json?: string;
  created_at: string;
}
