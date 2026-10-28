import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertTriangle, Calendar, User, Building, ShieldCheck } from 'lucide-react';
import { ContractObligation, ObligationStatus } from '../types';

interface ObligationsProps {
  obligations: ContractObligation[];
  onToggleComplete: (id: number) => void;
}

export const Obligations: React.FC<ObligationsProps> = ({
  obligations,
  onToggleComplete
}) => {
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'COMPLETED'>('ALL');

  const filteredObligations = obligations.filter((o) => {
    if (filter === 'ALL') return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-blue-500" />
            Contractual Obligations & Deadlines
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Track statutory commitments, audit deliverables, insurance renewals, and payment milestones.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'OVERDUE', label: 'Overdue' },
            { id: 'PENDING', label: 'Upcoming' },
            { id: 'COMPLETED', label: 'Completed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Obligations Grid */}
      <div className="space-y-3">
        {filteredObligations.map((obl) => (
          <div
            key={obl.id}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700/80 transition-all shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  obl.priority === 'CRITICAL' || obl.priority === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {obl.priority} PRIORITY
                </span>
                <span className="text-xs text-slate-500 font-medium">Recurrence: {obl.recurrence}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{obl.title}</h3>
              {obl.description && (
                <p className="text-xs text-slate-400 max-w-2xl">{obl.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                <span>Responsible: <strong className="text-slate-300">{obl.responsible_name}</strong></span>
                <span>Dept: <strong className="text-slate-300">{obl.department}</strong></span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  Due: {obl.due_date}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                obl.status === 'COMPLETED'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : obl.status === 'OVERDUE'
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                {obl.status}
              </span>

              {obl.status !== 'COMPLETED' && (
                <button
                  onClick={() => onToggleComplete(obl.id)}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Mark Fulfilled
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
