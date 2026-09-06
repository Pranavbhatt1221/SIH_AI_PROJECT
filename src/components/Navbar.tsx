import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Clock, UserCheck, AlertTriangle, Terminal, Cpu } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-navy-900/90 backdrop-blur-md border-b border-navy-750">
      {/* Top Security Advisory Banner */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-navy-900 to-amber-950/80 border-b border-cyan-500/20 px-4 py-1 flex items-center justify-between text-[11px] text-slate-300">
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="font-semibold text-cyan-300 tracking-wider">SIH PROTOTYPE SYSTEM</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">DEMO DATA ONLY — NOT CONNECTED TO GOVERNMENT SERVERS</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-mono text-[10px]">
            <Cpu className="w-3 h-3" />
            <span>PADDLEOCR + INSIGHTFACE v4</span>
          </div>
          <div className="flex items-center space-x-1 text-slate-400 font-mono">
            <Clock className="w-3 h-3 text-cyan-400" />
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform border border-cyan-400/40">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                SECURE<span className="text-cyan-400">BORDER</span>
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                AI SCREENING
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Fake Identity & Document Screening System</p>
          </div>
        </div>

        {/* Quick Officer Identity Badge */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-navy-850 border border-navy-700 text-xs">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400">INSPECTION OFFICER</div>
              <div className="font-semibold font-mono text-slate-200">OFFICER-742 • GATE 04</div>
            </div>
          </div>
          <button
            onClick={() => setCurrentPage('new_screening')}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-cyan-500/25 transition-all flex items-center space-x-1.5 active:scale-95"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>START SCREENING</span>
          </button>
        </div>
      </div>
    </header>
  );
};
