import React, { useState } from 'react';
import { FileText, ArrowLeft, Send, CheckCircle2, Building, DollarSign } from 'lucide-react';
import { ContractTemplate } from '../types';

interface ContractCreateProps {
  templates: ContractTemplate[];
  onBack: () => void;
  onCreated: (contractData: any) => void;
}

export const ContractCreate: React.FC<ContractCreateProps> = ({
  templates,
  onBack,
  onCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category_id: 1,
    counterparty_name: '',
    counterparty_contact: '',
    department: 'Engineering',
    estimated_value: 50000,
    currency: 'USD',
    renewal_type: 'Manual Review Required',
    renewal_reminder_days: 30,
    confidentiality: 'Confidential & Proprietary',
    description: '',
    document_notes: ''
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreated(formData);
  };

  const handleTemplateSelect = (tmpl: ContractTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setFormData({
      ...formData,
      title: `${tmpl.title} — ${formData.counterparty_name || 'Counterparty'}`,
      description: tmpl.description || ''
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel & Return to Directory
        </button>
      </div>

      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Draft New Contract Request
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Initiate a new agreement draft with automated sequential approval routing and metadata tracking.
          </p>
        </div>

        {/* Template Selector Carousel */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Select Legal Template (Optional)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {templates.slice(0, 6).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => handleTemplateSelect(tmpl)}
                className={`p-3 rounded-xl border cursor-pointer transition-all text-xs ${
                  selectedTemplateId === tmpl.id
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="font-semibold">{tmpl.title}</div>
                <div className="text-[10px] text-slate-500 mt-1">Category: {tmpl.category}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Contract Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Enterprise Cloud Infrastructure Agreement"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Counterparty Legal Entity *</label>
              <input
                type="text"
                required
                placeholder="e.g. Amazon Web Services Inc."
                value={formData.counterparty_name}
                onChange={(e) => setFormData({ ...formData, counterparty_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Counterparty Contact Email</label>
              <input
                type="email"
                placeholder="contracts@counterparty.com"
                value={formData.counterparty_contact}
                onChange={(e) => setFormData({ ...formData, counterparty_contact: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Business Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Engineering">Engineering</option>
                <option value="Operations">Operations</option>
                <option value="Compliance">Compliance</option>
                <option value="Finance">Finance</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Estimated Total Commitment Value ($)</label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-300">Renewal Protocol</label>
              <select
                value={formData.renewal_type}
                onChange={(e) => setFormData({ ...formData, renewal_type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              >
                <option value="Manual Review Required">Manual Review Required</option>
                <option value="Auto-renew (Annual)">Auto-renew (Annual)</option>
                <option value="Non-renewable">Non-renewable</option>
              </select>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-xs font-medium text-slate-300">Scope of Work & Commercial Terms</label>
            <textarea
              rows={3}
              placeholder="Outline specific covenants, milestone deliverables, or background rationale..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Save & Generate Draft Reference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
