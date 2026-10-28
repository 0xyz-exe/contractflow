import React from 'react';
import { ShieldCheck, Clock, User, FileText, CheckCircle2 } from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogProps {
  events: AuditEvent[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ events }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Immutable Audit Trail & Compliance Log
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Tamper-evident system log tracking contract lifecycle transitions, approval rationale, and document version hashes.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Authorized Actor</th>
                <th className="py-3 px-4">Resource Target</th>
                <th className="py-3 px-4">Event Metadata & Checksum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {events.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(ev.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-sans">
                      {ev.event_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                    {ev.actor_name}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {ev.resource_type} [{ev.resource_id}]
                  </td>
                  <td className="py-3 px-4 text-slate-400 max-w-md truncate">
                    {ev.metadata_json || '—'}
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
