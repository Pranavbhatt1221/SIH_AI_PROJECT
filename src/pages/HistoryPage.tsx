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
          <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Inspection Archive</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Screening Case History</h1>
          <p className="text-xs text-slate-500">
            Persistent ledger of all processed travel documents and recorded officer determinations.
          </p>
        </div>

        <button
          onClick={() => setCurrentPage('new_screening')}
          className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide shadow-sm transition-all self-start cursor-pointer"
        >
          New Screening
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
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
                  ? 'bg-blue-50 text-blue-800 border border-blue-200 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
            className="w-full bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 font-sans"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
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
            <tbody className="divide-y divide-slate-200">
              {history.map((item) => (
                <tr
                  key={item.case_id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => onSelectCase(item.case_id)}
                >
                  <td className="py-3.5 px-4 font-bold text-blue-700 group-hover:underline">
                    {item.case_id}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-bold text-slate-900">
                    {item.person_name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">
                    <span className="text-slate-500 text-[10px] block font-sans">{item.document_type}</span>
                    {item.document_number}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-black ${
                      item.risk_score >= 60 ? 'text-red-700' : item.risk_score >= 30 ? 'text-amber-700' : 'text-emerald-700'
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
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {item.officer_id}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(item.case_id);
                      }}
                      className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-sans font-bold transition-colors cursor-pointer"
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
