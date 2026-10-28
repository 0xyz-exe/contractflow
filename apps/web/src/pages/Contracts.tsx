import React, { useState } from 'react';
import { 
  FileText, Search, Filter, Plus, ChevronRight, 
  ExternalLink, Calendar, Building, DollarSign 
} from 'lucide-react';
import { Contract, ContractLifecycleStage } from '../types';

interface ContractsProps {
  contracts: Contract[];
  onSelectContract: (id: number) => void;
  onNavigateToCreate: () => void;
}

export const Contracts: React.FC<ContractsProps> = ({
  contracts,
  onSelectContract,
  onNavigateToCreate
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');

  const filteredContracts = contracts.filter((c) => {
    if (selectedStage !== 'ALL' && c.lifecycle_stage !== selectedStage) return false;
    if (deptFilter !== 'ALL' && c.department !== deptFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.contract_ref.toLowerCase().includes(q) ||
        c.counterparty_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStageBadge = (stage: ContractLifecycleStage) => {
    switch (stage) {
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'APPROVAL':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'INTERNAL_REVIEW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'DRAFT':
        return 'bg-slate-700/30 text-slate-400 border-slate-700/40';
      case 'RENEWAL':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'SIGNATURE':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-blue-500" />
            Enterprise Contracts Directory
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Full searchable portfolio of master agreements, SOWs, licenses, and non-disclosure covenants.
          </p>
        </div>
        <button
          onClick={onNavigateToCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Draft Contract
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Stage Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All Contracts' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'APPROVAL', label: 'In Approval' },
              { id: 'INTERNAL_REVIEW', label: 'Review' },
              { id: 'DRAFT', label: 'Draft' },
              { id: 'RENEWAL', label: 'Renewal' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStage(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStage === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Operations">Operations</option>
              <option value="Compliance">Compliance</option>
              <option value="Executive">Executive</option>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, reference, or counterparty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/70 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Contract Title</th>
                <th className="py-3 px-4">Lifecycle Stage</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-right">Commitment Value</th>
                <th className="py-3 px-4">Expiration / Review</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredContracts.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => onSelectContract(c.id)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 font-mono font-semibold text-blue-400">
                    {c.contract_ref}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-200 group-hover:text-blue-300 transition-colors">
                    {c.title}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStageBadge(c.lifecycle_stage)}`}>
                      {c.lifecycle_stage}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-medium">
                    {c.counterparty_name}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.department}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-200">
                    {c.estimated_value > 0 ? `$${c.estimated_value.toLocaleString()}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {c.end_date || 'Ongoing'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center text-blue-400 group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
