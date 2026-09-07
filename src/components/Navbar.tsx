import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Clock, UserCheck, Shield, CheckCircle2, Globe } from 'lucide-react';
import { PageView } from '../types';

interface NavbarProps {
  currentPage: PageView;
  setCurrentPage: (page: PageView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, setCurrentPage }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Official Advisory Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold text-slate-200 tracking-wider text-[10px] uppercase">
            National Border Control & Identity Verification Portal
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-emerald-400 font-medium hidden sm:inline flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 inline mr-0.5" />
            Central Registry Connected
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-1.5 text-slate-300 text-[10px]">
            <Globe className="w-3 h-3 text-slate-400" />
            <span>ICAO Doc 9303 Compliant</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 font-mono text-[11px]">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => setCurrentPage('landing')}
        >
          <div className="w-10 h-10 rounded-lg bg-blue-900 flex items-center justify-center shadow-sm border border-blue-800 group-hover:bg-blue-850 transition-colors">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 group-hover:text-blue-900 transition-colors">
                SECURE<span className="text-blue-700">BORDER</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-700 font-semibold tracking-wide">
                OFFICIAL PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Border Control Document & Biometric Verification System</p>
          </div>
        </div>

        {/* Quick Officer Identity Badge & Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-medium">INSPECTION OFFICER</div>
              <div className="font-bold text-slate-800 font-mono">OFFICER-742 • GATE 04</div>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('new_screening')}
            className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>START SCREENING</span>
          </button>
        </div>
      </div>
    </header>
  );
};

