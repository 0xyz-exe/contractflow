import React, { useState } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle2, Clock, AlertTriangle, 
  Download, Send, MessageSquare, Shield, Calendar, Building, DollarSign,
  Share2, Archive, Check
} from 'lucide-react';
import { Contract, ContractLifecycleStage } from '../types';

interface ContractDetailProps {
  contract: Contract;
  onBack: () => void;
  onSubmitWorkflow: (id: number) => void;
}

export const ContractDetail: React.FC<ContractDetailProps> = ({
  contract,
  onBack,
  onSubmitWorkflow
}) => {
  const [activeTab, setActiveTab] = useState<'documents' | 'approvals' | 'obligations' | 'discussion'>('approvals');
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState(contract.comments || []);
  const [submitted, setSubmitted] = useState(contract.lifecycle_stage === 'APPROVAL');

  const handleAddComment = () => {
    if (!commentInput.trim()) return;
    const newComment = {
      id: Date.now(),
      contract_id: contract.id,
      author_id: 1,
      author_name: 'Alex Vance (Executive)',
      comment_text: commentInput,
      clause_reference: 'General Review',
      is_internal_only: true,
      is_resolved: false,
      created_at: new Date().toISOString()
    };
    setComments([newComment, ...comments]);
    setCommentInput('');
  };

  const handleTriggerSubmit = () => {
    onSubmitWorkflow(contract.id);
    setSubmitted(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Contracts Directory
        </button>

        <div className="flex items-center gap-3">
          {contract.lifecycle_stage === 'DRAFT' && !submitted && (
            <button
              onClick={handleTriggerSubmit}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Submit to Approval Workflow
            </button>
          )}

          {submitted && (
            <span className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Approval Workflow In-Flight
            </span>
          )}
        </div>
      </div>

      {/* Contract Header Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20">
                {contract.contract_ref}
              </span>
              <span className="text-xs text-slate-400">
                Created: {contract.created_at ? new Date(contract.created_at).toLocaleDateString() : 'Recent'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {contract.title}
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl">
              {contract.description || 'Enterprise contract lifecycle tracking.'}
            </p>
          </div>

          <div className="flex sm:flex-col lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-800 text-right">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Contract Value
            </div>
            <div className="text-2xl font-bold text-white">
              ${contract.estimated_value.toLocaleString()} <span className="text-xs text-slate-400 font-normal">{contract.currency}</span>
            </div>
          </div>
        </div>

        {/* 5-Stage Stepper Tracker */}
        <div className="pt-4 border-t border-slate-800/80">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            Governance & Approval Progress
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'DRAFT', label: '1. Drafting', done: true },
              { id: 'INTERNAL_REVIEW', label: '2. Review', done: ['INTERNAL_REVIEW', 'APPROVAL', 'SIGNATURE', 'ACTIVE'].includes(contract.lifecycle_stage) },
              { id: 'APPROVAL', label: '3. Approval', done: ['APPROVAL', 'SIGNATURE', 'ACTIVE'].includes(contract.lifecycle_stage) || submitted },
              { id: 'SIGNATURE', label: '4. Signature', done: ['SIGNATURE', 'ACTIVE'].includes(contract.lifecycle_stage) },
              { id: 'ACTIVE', label: '5. Executed Active', done: contract.lifecycle_stage === 'ACTIVE' }
            ].map((step, idx) => (
              <div
                key={step.id}
                className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
                  step.done
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                    : 'border-slate-800 bg-slate-950/40 text-slate-500'
                }`}
              >
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step.done ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {step.done ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                </div>
                <span className="truncate">{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div>
            <span className="text-slate-500 block">Counterparty</span>
            <strong className="text-slate-200">{contract.counterparty_name}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Department</span>
            <strong className="text-slate-200">{contract.department}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Renewal Protocol</span>
            <strong className="text-slate-200">{contract.renewal_type}</strong>
          </div>
          <div>
            <span className="text-slate-500 block">Confidentiality</span>
            <strong className="text-slate-200">{contract.confidentiality}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-2 text-xs font-semibold">
        {[
          { id: 'approvals', label: `Approval Hierarchy (${contract.approval_tasks?.length || 0})` },
          { id: 'documents', label: `Document Versions (${contract.documents?.length || 1})` },
          { id: 'obligations', label: `Obligations & Deadlines (${contract.obligations?.length || 0})` },
          { id: 'discussion', label: `Review Notes & Clauses (${comments.length})` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`py-3 px-4 border-b-2 transition-all ${
              activeTab === t.id
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Approval Hierarchy */}
      {activeTab === 'approvals' && (
        <div className="space-y-3">
          {(contract.approval_tasks && contract.approval_tasks.length > 0) ? (
            contract.approval_tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold flex items-center justify-center text-[10px]">
                      {task.stage_order}
                    </span>
                    <strong className="text-sm font-semibold text-white">{task.stage_name}</strong>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                      Role: {task.assigned_role}
                    </span>
                  </div>
                  {task.decision_rationale && (
                    <p className="text-slate-300 italic pl-7 text-xs">
                      "{task.decision_rationale}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 pl-7 sm:pl-0">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    task.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No approval tasks initiated yet. Click "Submit to Approval Workflow" above to begin routing.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Document Versions */}
      {activeTab === 'documents' && (
        <div className="space-y-3">
          {(contract.documents && contract.documents.length > 0 ? contract.documents : [
            {
              id: 99,
              version_num: 1,
              original_filename: `${contract.contract_ref}_draft.txt`,
              file_size: 4200,
              mime_type: 'text/plain',
              sha256_hash: '3a7b9e8471c2f9d8a5b2c7e4f1a6d9b8c3e5f2a1b4c7d9e8f1a2b3c4d5e6f7a8',
              version_notes: 'Initial generated baseline document',
              created_at: contract.created_at
            }
          ]).map((doc) => (
            <div
              key={doc.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <strong className="text-sm font-semibold text-white">{doc.original_filename}</strong>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400">
                    Version {doc.version_num}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-500">
                  SHA-256: {doc.sha256_hash}
                </div>
                {doc.version_notes && (
                  <p className="text-slate-400 text-xs">{doc.version_notes}</p>
                )}
              </div>

              <a
                href={`/api/v1/contracts/${contract.id}/documents/${doc.id}/download`}
                download={doc.original_filename}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Integrity Copy
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Obligations */}
      {activeTab === 'obligations' && (
        <div className="space-y-3">
          {(contract.obligations && contract.obligations.length > 0) ? (
            contract.obligations.map((obl) => (
              <div
                key={obl.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-white">{obl.title}</strong>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      obl.priority === 'CRITICAL' || obl.priority === 'HIGH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {obl.priority}
                    </span>
                  </div>
                  <div className="text-slate-400">
                    Assigned: <strong className="text-slate-300">{obl.responsible_name}</strong> ({obl.department}) • Due: <strong className="text-amber-400">{obl.due_date}</strong>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                  obl.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : obl.status === 'OVERDUE'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {obl.status}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No contractual obligations or milestones registered for this contract.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Review Comments & Clauses */}
      {activeTab === 'discussion' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Leave legal note or flag specific clause covenant..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAddComment}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              Post Note
            </button>
          </div>

          <div className="space-y-3">
            {comments.map((cm) => (
              <div
                key={cm.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{cm.author_name}</span>
                  <span className="text-[10px] text-slate-500">
                    {cm.created_at ? new Date(cm.created_at).toLocaleString() : 'Recent'}
                  </span>
                </div>
                {cm.clause_reference && (
                  <div className="text-[11px] font-mono text-blue-400">
                    Ref: {cm.clause_reference}
                  </div>
                )}
                <p className="text-slate-300 leading-relaxed">{cm.comment_text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
