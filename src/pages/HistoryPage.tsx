import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  User,
  FileText
} from 'lucide-react';
import { PageView, ScreeningCase } from '../types';
import { Badge } from '../components/Badge';

interface HistoryPageProps {
  onSelectCase: (caseId: string) => void;
  setCurrentPage: (page: PageView) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectCase, setCurrentPage }) => {
  const [history, setHistory] = useState<ScreeningCase[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/screening/history?filter=${filter}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filter, search]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Inspection Archive</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Screening Case History</h1>
          <p className="text-xs text-slate-400">
            Persistent ledger of all processed travel documents and recorded officer determinations.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('new_screening')}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide shadow-md transition-all self-start cursor-pointer"
        >
          New Screening
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-750 pb-3">
        <div className="flex items-center space-x-1.5 overflow-x-auto text-xs font-bold">
          {[
            { id: 'ALL', label: 'All Cases' },
            { id: 'VERIFIED', label: 'Verified (PASS)' },
            { id: 'REVIEW', label: 'Review Required' },
            { id: 'FAILED', label: 'Failed / Denied' },
            { id: 'HIGH_RISK', label: 'High Risk' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                filter === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-navy-850'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Case ID, Name, Passport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-900 border border-navy-750 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl bg-navy-900 border border-navy-750 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-navy-800 bg-navy-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4 font-sans">Traveler Name</th>
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4 font-sans">Officer Decision</th>
                <th className="py-3 px-4">Officer ID</th>
                <th className="py-3 px-4 text-right font-sans">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {history.map((item) => (
                <tr
                  key={item.case_id}
                  className="hover:bg-navy-850/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectCase(item.case_id)}
                >
                  <td className="py-3.5 px-4 font-bold text-cyan-400 group-hover:underline">
                    {item.case_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-white">
                    {item.person_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="text-slate-400 text-[10px] block font-sans">{item.document_type}</span>
                    {item.document_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-black ${
                      item.risk_score >= 60 ? 'text-red-400' : item.risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {item.risk_score}/100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={item.risk_level} />
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={item.decision} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {item.officer_id}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(item.case_id);
                      }}
                      className="px-2.5 py-1 rounded bg-navy-800 hover:bg-cyan-500/20 text-cyan-400 border border-navy-700 text-[10px] font-sans font-bold transition-colors cursor-pointer"
                    >
                      Open Case
                    </button>
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
