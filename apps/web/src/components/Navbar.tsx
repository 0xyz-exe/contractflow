import React from 'react';
import { 
  FileText, Bell, Search, Shield, Building, Download, 
  CheckCircle2, User as UserIcon
} from 'lucide-react';
import { mockCurrentUser } from '../data/mockData';

interface NavbarProps {
  onSearchChange?: (val: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearchChange }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Brand & Organization */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              ContractFlow
            </span>
            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CLM Enterprise
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800 text-xs text-slate-400">
          <Building className="w-3.5 h-3.5 text-slate-500" />
          <span>Global Logistics & Cloud Corp</span>
        </div>
      </div>

      {/* Center Search */}
      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search contracts (e.g. CTR-2026, AWS, Maersk)..."
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        <a
          href="/api/v1/dashboard/export/contracts.csv"
          download="contracts_export.csv"
          className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          Export CSV
        </a>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-900 animate-pulse" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
            AV
          </div>
          <div className="hidden xl:block text-left">
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-1">
              {mockCurrentUser.full_name}
              <Shield className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium">
              {mockCurrentUser.role} • {mockCurrentUser.department}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
