import {
  Contract, ContractTemplate, ContractClause, DashboardMetrics,
  AuditEvent, ContractObligation, ApprovalTask
} from '../types';
import {
  mockMetrics, mockContracts, mockTemplates, mockClauses,
  mockAuditEvents
} from '../data/mockData';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cf_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/metrics`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    return mockMetrics;
  },

  async getContracts(stage?: string, search?: string): Promise<Contract[]> {
    try {
      const params = new URLSearchParams();
      if (stage && stage !== 'ALL') params.append('stage', stage);
      if (search) params.append('search', search);
      const res = await fetch(`${API_BASE}/contracts/?${params.toString()}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    
    let result = [...mockContracts];
    if (stage && stage !== 'ALL') {
      result = result.filter(c => c.lifecycle_stage === stage);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.contract_ref.toLowerCase().includes(q) ||
        c.counterparty_name.toLowerCase().includes(q)
      );
    }
    return result;
  },

  async getContractDetail(id: number): Promise<Contract> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${id}`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    const found = mockContracts.find(c => c.id === id);
    if (found) return found;
    return mockContracts[0];
  },

  async createContract(data: Partial<Contract>): Promise<Contract> {
    try {
      const res = await fetch(`${API_BASE}/contracts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch {}
    
    const newRef = `CTR-2026-00000${mockContracts.length + 1}`;
    const newContract: Contract = {
      id: mockContracts.length + 1,
      organization_id: 1,
      contract_ref: newRef,
      title: data.title || 'Untitled Agreement',
      lifecycle_stage: 'DRAFT',
      counterparty_name: data.counterparty_name || 'Counterparty Inc',
      department: data.department || 'Operations',
      owner_id: 1,
      estimated_value: data.estimated_value || 0,
      currency: 'USD',
      renewal_type: data.renewal_type || 'Manual',
      renewal_reminder_days: 30,
      confidentiality: 'Confidential',
      current_version_num: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockContracts.unshift(newContract);
    return newContract;
  },

  async submitContract(id: number): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/contracts/${id}/submit`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (res.ok) return true;
    } catch {}
    const c = mockContracts.find(x => x.id === id);
    if (c) c.lifecycle_stage = 'APPROVAL';
    return true;
  },

  async getApprovals(): Promise<ApprovalTask[]> {
    try {
      const res = await fetch(`${API_BASE}/approvals/`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    const tasks: ApprovalTask[] = [];
    mockContracts.forEach(c => {
      if (c.approval_tasks) tasks.push(...c.approval_tasks);
    });
    return tasks;
  },

  async recordApprovalDecision(taskId: number, action: string, rationale: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/approvals/${taskId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ action, rationale })
      });
      if (res.ok) return true;
    } catch {}
    return true;
  },

  async getTemplates(): Promise<ContractTemplate[]> {
    try {
      const res = await fetch(`${API_BASE}/templates/`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    return mockTemplates;
  },

  async getClauses(): Promise<ContractClause[]> {
    try {
      const res = await fetch(`${API_BASE}/templates/clauses`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    return mockClauses;
  },

  async getObligations(): Promise<ContractObligation[]> {
    try {
      const res = await fetch(`${API_BASE}/obligations/`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    const obls: ContractObligation[] = [];
    mockContracts.forEach(c => {
      if (c.obligations) obls.push(...c.obligations);
    });
    return obls;
  },

  async getAuditLog(): Promise<AuditEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/audit`, { headers: getAuthHeader() });
      if (res.ok) return await res.json();
    } catch {}
    return mockAuditEvents;
  }
};
