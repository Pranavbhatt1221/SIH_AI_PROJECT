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
  AlertCircle
} from 'lucide-react';
import { PageView } from '../types';

interface SidebarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard' as PageView, label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'new_screening' as PageView, label: 'New Screening', icon: ShieldPlus, badge: 'NEW' },
    { id: 'history' as PageView, label: 'Screening History', icon: History, badge: null },
    { id: 'database' as PageView, label: 'Authorized Database', icon: Database, badge: 'MOCK' },
    { id: 'audit' as PageView, label: 'Audit Logs', icon: ChainIcon, badge: 'SHA-256' },
    { id: 'analytics' as PageView, label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'settings' as PageView, label: 'Settings', icon: Settings, badge: null },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-750 flex flex-col justify-between py-4 select-none shrink-0 min-h-[calc(100vh-64px)]">
      <div>
        {/* Home / Overview link */}
        <div className="px-4 mb-3">
          <button
            onClick={() => setCurrentPage('landing')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              currentPage === 'landing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-navy-800'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Overview & Mission</span>
          </button>
        </div>

        <div className="px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Command Center Navigation
        </div>

        <nav className="mt-2 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/25 to-blue-500/10 text-cyan-300 border-l-4 border-cyan-400 font-semibold shadow-sm shadow-cyan-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-navy-850'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    item.badge === 'NEW'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.badge === 'SHA-256'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Engine Status Footer */}
      <div className="px-4 pt-4 border-t border-navy-800 text-[11px] space-y-2">
        <div className="rounded-lg bg-navy-850 p-3 border border-navy-750">
          <div className="flex items-center justify-between text-slate-400 mb-1.5 font-mono text-[10px]">
            <span>SYSTEM HEALTH</span>
            <span className="text-emerald-400 font-bold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>100% OPERATIONAL</span>
            </span>
          </div>
          <div className="space-y-1 text-[10px] text-slate-400">
            <div className="flex justify-between">
              <span>OCR Model:</span>
              <span className="text-cyan-400 font-mono">PaddleOCR v4</span>
            </div>
            <div className="flex justify-between">
              <span>Biometrics:</span>
              <span className="text-cyan-400 font-mono">InsightFace 512-D</span>
            </div>
            <div className="flex justify-between">
              <span>Tampering:</span>
              <span className="text-cyan-400 font-mono">ELA + Disparity</span>
            </div>
            <div className="flex justify-between">
              <span>Audit Chain:</span>
              <span className="text-purple-400 font-mono">SHA-256 Chained</span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 text-center leading-tight">
          Smart India Hackathon • Prototype
        </div>
      </div>
    </aside>
  );
};
