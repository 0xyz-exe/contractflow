import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Contracts } from './pages/Contracts';
import { ContractDetail } from './pages/ContractDetail';
import { ContractCreate } from './pages/ContractCreate';
import { Approvals } from './pages/Approvals';
import { Templates } from './pages/Templates';
import { Obligations } from './pages/Obligations';
import { AuditLog } from './pages/AuditLog';
import { api } from './services/api';
import { 
  Contract, DashboardMetrics, ContractTemplate, 
  ContractClause, ApprovalTask, ContractObligation, AuditEvent 
} from './types';
import { 
  mockContracts, mockMetrics, mockTemplates, 
  mockClauses, mockAuditEvents 
} from './data/mockData';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);

  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [metrics, setMetrics] = useState<DashboardMetrics>(mockMetrics);
  const [templates, setTemplates] = useState<ContractTemplate[]>(mockTemplates);
  const [clauses, setClauses] = useState<ContractClause[]>(mockClauses);
  const [approvals, setApprovals] = useState<ApprovalTask[]>([]);
  const [obligations, setObligations] = useState<ContractObligation[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(mockAuditEvents);

  useEffect(() => {
    // Load initial data from API or fallbacks
    api.getContracts().then(setContracts);
    api.getMetrics().then(setMetrics);
    api.getTemplates().then(setTemplates);
    api.getClauses().then(setClauses);
    api.getApprovals().then(setApprovals);
    api.getObligations().then(setObligations);
    api.getAuditLog().then(setAuditLog);
  }, []);

  const handleSelectContract = (id: number) => {
    setSelectedContractId(id);
    setCurrentTab('detail');
  };

  const handleBackToContracts = () => {
    setSelectedContractId(null);
    setCurrentTab('contracts');
  };

  const handleCreateContract = async (formData: any) => {
    const created = await api.createContract(formData);
    setContracts([created, ...contracts]);
    setSelectedContractId(created.id);
    setCurrentTab('detail');
  };

  const handleSubmitWorkflow = async (contractId: number) => {
    await api.submitContract(contractId);
    setContracts(contracts.map(c => c.id === contractId ? { ...c, lifecycle_stage: 'APPROVAL' } : c));
  };

  const handleDecision = async (taskId: number, action: string, rationale: string) => {
    await api.recordApprovalDecision(taskId, action, rationale);
    setApprovals(approvals.map(t => t.id === taskId ? { 
      ...t, 
      status: action === 'APPROVE' ? 'APPROVED' : action === 'REJECT' ? 'REJECTED' : 'CHANGES_REQUESTED',
      decision_rationale: rationale 
    } : t));
  };

  const handleToggleObligation = (id: number) => {
    setObligations(obligations.map(o => o.id === id ? { ...o, status: 'COMPLETED' } : o));
  };

  const selectedContract = contracts.find(c => c.id === selectedContractId) || contracts[0];

  const pendingApprovalsCount = approvals.filter(t => t.status === 'PENDING').length || 3;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar onSearchChange={(q) => {
        if (q && currentTab !== 'contracts') setCurrentTab('contracts');
      }} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            if (tab !== 'detail') setSelectedContractId(null);
          }}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentTab === 'dashboard' && (
            <Dashboard
              metrics={metrics}
              contracts={contracts}
              onSelectContract={handleSelectContract}
              onNavigateToApprovals={() => setCurrentTab('approvals')}
              onNavigateToDraft={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'contracts' && (
            <Contracts
              contracts={contracts}
              onSelectContract={handleSelectContract}
              onNavigateToCreate={() => setCurrentTab('create')}
            />
          )}

          {currentTab === 'detail' && selectedContract && (
            <ContractDetail
              contract={selectedContract}
              onBack={handleBackToContracts}
              onSubmitWorkflow={handleSubmitWorkflow}
            />
          )}

          {currentTab === 'create' && (
            <ContractCreate
              templates={templates}
              onBack={handleBackToContracts}
              onCreated={handleCreateContract}
            />
          )}

          {currentTab === 'approvals' && (
            <Approvals
              tasks={approvals.length > 0 ? approvals : (selectedContract.approval_tasks || [])}
              contracts={contracts}
              onSelectContract={handleSelectContract}
              onDecision={handleDecision}
            />
          )}

          {currentTab === 'templates' && (
            <Templates
              templates={templates}
              clauses={clauses}
            />
          )}

          {currentTab === 'obligations' && (
            <Obligations
              obligations={obligations.length > 0 ? obligations : (selectedContract.obligations || [])}
              onToggleComplete={handleToggleObligation}
            />
          )}

          {currentTab === 'audit' && (
            <AuditLog events={auditLog} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
