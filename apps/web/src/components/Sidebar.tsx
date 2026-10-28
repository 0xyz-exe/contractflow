import React from 'react';
import { 
  LayoutDashboard, FileText, CheckSquare, PlusCircle, 
  Library, Clock, ShieldCheck, Settings, Users, AlertCircle 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  pendingApprovalsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentTab, 
  onTabChange, 
  pendingApprovalsCount = 3 
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'contracts', label: 'All Contracts', icon: FileText },
    { 
      id: 'approvals', 
      label: 'My Approvals', 
      icon: CheckSquare, 
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined 
    },
    { id: 'create', label: 'Draft New Contract', icon: PlusCircle, highlight: true },
    { id: 'templates', label: 'Templates & Clauses', icon: Library },
    { id: 'obligations', label: 'Obligations & Deadlines', icon: Clock },
    { id: 'audit', label: 'Audit Trail & Compliance', icon: ShieldCheck },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col justify-between py-6 shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6 px-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Main Management
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                      : item.highlight
                      ? 'text-blue-400 hover:bg-blue-500/10 hover:text-blue-300'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Administration */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-2">
            Governance & Settings
          </div>
          <div className="space-y-1 text-sm text-slate-400">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Team & RBAC Policies</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800/50 cursor-pointer">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Approval Workflows</span>
            </div>
          </div>
        </div>
      </div>

      {/* SLA & Security Footer Card */}
      <div className="px-4">
        <div className="p-3.5 rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-950/40 to-slate-900/60 text-xs">
          <div className="flex items-center gap-2 text-blue-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Immutable Integrity</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            All document uploads cryptographically stamped with SHA-256 and recorded into append-only audit log.
          </p>
        </div>
      </div>
    </aside>
  );
};
