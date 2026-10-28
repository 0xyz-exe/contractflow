import React, { useState } from 'react';
import { Library, FileText, ShieldAlert, Copy, Check, Search, Tag } from 'lucide-react';
import { ContractTemplate, ContractClause } from '../types';

interface TemplatesProps {
  templates: ContractTemplate[];
  clauses: ContractClause[];
}

export const Templates: React.FC<TemplatesProps> = ({ templates, clauses }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'clauses'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTemplates = templates.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredClauses = clauses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.clause_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Library className="w-6 h-6 text-blue-500" />
            Standard Templates & Clause Library
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Pre-approved enterprise boilerplate agreements and risk-graded modular clauses.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Contract Templates ({templates.length})
          </button>
          <button
            onClick={() => setActiveTab('clauses')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'clauses'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clause Library ({clauses.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          placeholder={activeTab === 'templates' ? 'Search templates (e.g. NDA, SaaS, MSA)...' : 'Search clauses (e.g. Liability, Indemnity)...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Templates View */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => (
            <div
              key={tmpl.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 hover:border-slate-700/80 transition-all shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tmpl.category}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">v{tmpl.version}</span>
              </div>
              <h3 className="text-sm font-bold text-white">{tmpl.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{tmpl.description}</p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>Standard Legal Verified</span>
                <span className="text-blue-400 font-medium cursor-pointer hover:underline">
                  Use in Draft →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clauses View */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          {filteredClauses.map((clause) => (
            <div
              key={clause.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{clause.title}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                    {clause.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    clause.risk_level === 'HIGH'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : clause.risk_level === 'MEDIUM'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {clause.risk_level} RISK
                  </span>
                  <button
                    onClick={() => handleCopy(clause.id, clause.clause_text)}
                    className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="Copy clause text"
                  >
                    {copiedId === clause.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300 leading-relaxed">
                {clause.clause_text}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
