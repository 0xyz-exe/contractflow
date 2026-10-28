import React, { useState } from 'react';
import { 
  CheckSquare, CheckCircle2, XCircle, AlertTriangle, Clock, 
  Send, Shield, FileText, ChevronRight, MessageSquare 
} from 'lucide-react';
import { ApprovalTask, Contract } from '../types';

interface ApprovalsProps {
  tasks: ApprovalTask[];
  contracts: Contract[];
  onSelectContract: (id: number) => void;
  onDecision: (taskId: number, action: string, rationale: string) => void;
}

export const Approvals: React.FC<ApprovalsProps> = ({
  tasks,
  contracts,
  onSelectContract,
  onDecision
}) => {
  const [selectedTask, setSelectedTask] = useState<ApprovalTask | null>(null);
  const [modalAction, setModalAction] = useState<'APPROVE' | 'REJECT' | 'REQUEST_CHANGES' | null>(null);
  const [rationale, setRationale] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const openDecisionModal = (task: ApprovalTask, action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES') => {
    setSelectedTask(task);
    setModalAction(action);
    setRationale(action === 'APPROVE' ? 'Approved in accordance with company governance guidelines.' : '');
    setErrorMsg('');
  };

  const handleConfirmDecision = () => {
    if (!rationale.trim() || rationale.length < 3) {
      setErrorMsg('A specific rationale of at least 3 characters is mandatory for all governance decisions.');
      return;
    }
    if (selectedTask && modalAction) {
      onDecision(selectedTask.id, modalAction, rationale);
      setModalAction(null);
      setSelectedTask(null);
    }
  };

  const getContractForTask = (contractId: number) => {
    return contracts.find(c => c.id === contractId);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <CheckSquare className="w-6 h-6 text-amber-500" />
          Multi-Tier Approval Center
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Review contractual legal clauses, milestone spend commitments, and execute authorized governance decisions.
        </p>
      </div>

      {/* Task Queue Cards */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const contract = getContractForTask(task.contract_id);
          return (
            <div
              key={task.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/50 hover:border-slate-700/80 transition-all shadow-lg space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex items-center justify-center">
                    {task.stage_order}
                  </span>
                  <span className="text-sm font-bold text-white">{task.stage_name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                    Required Role: {task.assigned_role}
                  </span>
                </div>
                <div className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA Deadline: {task.deadline ? new Date(task.deadline).toLocaleDateString() : '3 Days'}</span>
                </div>
              </div>

              {contract && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-blue-400">{contract.contract_ref}</span>
                      <strong className="text-sm font-semibold text-slate-200">{contract.title}</strong>
                    </div>
                    <div className="text-xs text-slate-400">
                      Party: <span className="text-slate-300 font-medium">{contract.counterparty_name}</span> • 
                      Value: <span className="text-emerald-400 font-semibold">${contract.estimated_value.toLocaleString()} {contract.currency}</span> • 
                      Dept: <span className="text-slate-300">{contract.department}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onSelectContract(contract.id)}
                      className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
                    >
                      Inspect Agreement
                    </button>
                    {task.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => openDecisionModal(task, 'REQUEST_CHANGES')}
                          className="px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold transition-colors"
                        >
                          Request Revisions
                        </button>
                        <button
                          onClick={() => openDecisionModal(task, 'REJECT')}
                          className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openDecisionModal(task, 'APPROVE')}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition-colors"
                        >
                          Approve Stage
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-400">
                        {task.status}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Decision Rationale Modal */}
      {modalAction && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl space-y-4 animate-scaleUp">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Confirm Governance Decision: {modalAction}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Stage: <strong className="text-slate-200">{selectedTask.stage_name}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Decision Rationale / Review Comments (Mandatory) *
              </label>
              <textarea
                rows={4}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="State specific commercial, legal, or budgetary justification..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setModalAction(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-lg transition-all ${
                  modalAction === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                    : modalAction === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                    : 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                }`}
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
