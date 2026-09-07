import React from 'react';
import {
  LayoutDashboard,
  ShieldPlus,
  History,
  Database,
  Link as ChainIcon,
  BarChart3,
  Settings,
  Home,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard' as PageView, label: 'Inspection Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'new_screening' as PageView, label: 'Document Screening', icon: ShieldPlus, badge: 'NEW' },
    { id: 'history' as PageView, label: 'Screening Archive', icon: History, badge: null },
    { id: 'database' as PageView, label: 'Authorized Registry', icon: Database, badge: null },
    { id: 'audit' as PageView, label: 'Audit Logs', icon: ChainIcon, badge: 'VERIFIED' },
    { id: 'analytics' as PageView, label: 'Station Analytics', icon: BarChart3, badge: null },
    { id: 'settings' as PageView, label: 'System Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between py-4 select-none shrink-0 min-h-[calc(100vh-64px)] shadow-sm">
      <div>
        {/* Home / Overview link */}
        <div className="px-3 mb-3">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentPage === 'landing'
                ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Overview & Guidelines</span>
          </button>
        </div>

        <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Navigation Menu
        </div>

        <nav className="mt-2 px-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-900 border-l-4 border-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-blue-700' : 'text-slate-500 group-hover:text-slate-700'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    item.badge === 'NEW'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.badge === 'VERIFIED'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-slate-100 text-slate-700 border border-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="px-3 pt-4 border-t border-slate-200 text-[11px] space-y-2">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
          <div className="flex items-center justify-between text-slate-600 mb-2 text-[10px] font-semibold">
            <span>TERMINAL STATUS</span>
            <span className="text-emerald-700 font-bold flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>OPERATIONAL</span>
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-600">
            <div className="flex justify-between">
              <span>OCR Verification:</span>
              <span className="text-slate-900 font-medium">Active (MRZ & Text)</span>
            </div>
            <div className="flex justify-between">
              <span>Biometric Engine:</span>
              <span className="text-slate-900 font-medium">Standard 1:1 Match</span>
            </div>
            <div className="flex justify-between">
              <span>Forensics:</span>
              <span className="text-slate-900 font-medium">Error Level & Splicing</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Chain:</span>
              <span className="text-blue-800 font-medium">SHA-256 Ledger</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-600 text-center font-medium">
          Official Border Control Security System
        </div>
      </div>
    </aside>
  );
};

