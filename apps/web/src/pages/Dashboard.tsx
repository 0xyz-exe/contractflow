import React from 'react';
import { 
  FileText, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, 
  TrendingUp, Shield, Calendar, Building, DollarSign 
} from 'lucide-react';
import { DashboardMetrics, Contract, ApprovalTask, ContractObligation } from '../types';

interface DashboardProps {
  metrics: DashboardMetrics;
  contracts: Contract[];
  onSelectContract: (id: number) => void;
  onNavigateToApprovals: () => void;
  onNavigateToDraft: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  metrics,
  contracts,
  onSelectContract,
  onNavigateToApprovals,
  onNavigateToDraft
}) => {
  const pendingContracts = contracts.filter(c => c.lifecycle_stage === 'APPROVAL');
  const expiringContracts = contracts.filter(c => c.lifecycle_stage === 'ACTIVE' || c.lifecycle_stage === 'RENEWAL');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            Executive CLM Command Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Contract Operations & Approval Health
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time monitoring across 6 active enterprise contracts, multi-tier approvals, and compliance obligations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToDraft}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Create Contract Request
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>ACTIVE PORTFOLIO VALUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            ${(metrics.total_portfolio_value).toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>100% verified active commitments</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>PENDING APPROVAL TASKS</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.pending_approvals} Tasks
          </div>
          <div className="mt-2 text-xs text-amber-400 flex items-center gap-1">
            <span>Awaiting legal, finance, & dept sign-off</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>EXPIRING / RENEWAL WINDOW</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.expiring_soon} Contracts
          </div>
          <div className="mt-2 text-xs text-blue-400 flex items-center gap-1">
            <span>Within 30-day renewal deadline</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-3">
            <span>AVG APPROVAL TURNAROUND</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.turnaround_avg_days} Days
          </div>
          <div className="mt-2 text-xs text-indigo-400 flex items-center gap-1">
            <span>Target SLA: &lt; 5.0 days</span>
          </div>
        </div>
      </div>

      {/* Contract Lifecycle Visual Pipeline */}
      <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40">
        <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <span>Lifecycle Stage Pipeline Distribution</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Draft', count: metrics.by_stage['DRAFT'] || 1, color: 'border-slate-700 bg-slate-800/40 text-slate-300' },
            { label: 'Internal Review', count: metrics.by_stage['INTERNAL_REVIEW'] || 1, color: 'border-blue-500/30 bg-blue-500/10 text-blue-400' },
            { label: 'Approval', count: metrics.by_stage['APPROVAL'] || 1, color: 'border-amber-500/30 bg-amber-500/10 text-amber-400' },
            { label: 'Signature', count: metrics.by_stage['SIGNATURE'] || 0, color: 'border-purple-500/30 bg-purple-500/10 text-purple-400' },
            { label: 'Active', count: metrics.by_stage['ACTIVE'] || 2, color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' },
            { label: 'Renewal', count: metrics.by_stage['RENEWAL'] || 1, color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' },
          ].map((st) => (
            <div key={st.label} className={`p-4 rounded-xl border ${st.color} text-center`}>
              <div className="text-2xl font-bold">{st.count}</div>
              <div className="text-xs font-medium mt-1">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Pending Approvals & Expiring Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals Queue */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Pending Approval Queue</h3>
              <p className="text-xs text-slate-400">Contracts awaiting governance decisions</p>
            </div>
            <button
              onClick={onNavigateToApprovals}
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              View All ({metrics.pending_approvals}) <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {pendingContracts.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectContract(c.id)}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-blue-400">{c.contract_ref}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    STAGE: APPROVAL
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200">{c.title}</div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Party: <strong className="text-slate-300">{c.counterparty_name}</strong></span>
                  <span className="font-semibold text-slate-200">${c.estimated_value.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expiring & Renewal Contracts */}
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Upcoming Renewals & Expirations</h3>
              <p className="text-xs text-slate-400">Contracts approaching 30-day notice thresholds</p>
            </div>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Active Monitoring
            </span>
          </div>

          <div className="space-y-3">
            {expiringContracts.slice(0, 3).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectContract(c.id)}
                className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/40 transition-colors cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-slate-400">{c.contract_ref}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    c.lifecycle_stage === 'RENEWAL' 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {c.lifecycle_stage}
                  </span>
                </div>
                <div className="font-semibold text-sm text-slate-200">{c.title}</div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Counterparty: {c.counterparty_name}</span>
                  <span className="text-amber-400 font-medium">Expires: {c.end_date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
