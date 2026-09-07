import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck2,
  ScanFace,
  Clock,
  ExternalLink,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertOctagon
} from 'lucide-react';
import { PageView, ScreeningCase } from '../types';
import { Badge } from '../components/Badge';

interface DashboardPageProps {
  setCurrentPage: (page: PageView) => void;
  onSelectCase: (caseId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setCurrentPage, onSelectCase }) => {
  const [stats, setStats] = useState<any>({
    total_screened: 0,
    verified: 0,
    review_required: 0,
    failed: 0,
    high_risk_documents: 0,
    tampering_detected: 0,
    face_mismatches: 0,
    expired_documents: 0,
    blacklisted_documents: 0
  });
  const [recentScreenings, setRecentScreenings] = useState<ScreeningCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentScreenings(data.stats.recent_screenings || []);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inspection Command Center</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              LIVE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time biometric and credential screening status at Border Inspection Terminal Gate 04.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-sm"
            title="Refresh Live Statistics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setCurrentPage('new_screening')}
            className="px-4 py-2.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs tracking-wide shadow-sm hover:shadow transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>START NEW SCREENING</span>
          </button>
        </div>
      </div>

      {/* Primary Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Screened */}
        <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Screened</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">{stats.total_screened}</div>
          <div className="text-[10px] text-slate-500">Inspection Volume</div>
        </div>

        {/* Verified / Pass */}
        <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified (PASS)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-800 font-mono">{stats.verified}</div>
          <div className="text-[10px] text-emerald-700 font-medium">Cleared for Entry</div>
        </div>

        {/* Review Required */}
        <div className="rounded-xl bg-amber-50/60 border border-amber-200 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-amber-900">
            <span className="text-[11px] font-bold uppercase tracking-wider">Review Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-900 font-mono">{stats.review_required}</div>
          <div className="text-[10px] text-amber-800 font-medium">Secondary Inspection</div>
        </div>

        {/* Failed / Denied */}
        <div className="rounded-xl bg-red-50/60 border border-red-200 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">Failed / Denied</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-800 font-mono">{stats.failed}</div>
          <div className="text-[10px] text-red-700 font-medium">Denial of Entry</div>
        </div>

        {/* High Risk Total */}
        <div className="rounded-xl bg-red-50/60 border border-red-200 p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-red-800">
            <span className="text-[11px] font-bold uppercase tracking-wider">High Risk</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-red-800 font-mono">{stats.high_risk_documents}</div>
          <div className="text-[10px] text-slate-500">Score &ge; 60/100</div>
        </div>
      </div>

      {/* Secondary Forensic Alert Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Tampering Detected</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{stats.tampering_detected} cases</div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ScanFace className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Face Mismatches</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{stats.face_mismatches} cases</div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Expired Documents</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{stats.expired_documents} cases</div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-3.5 flex items-center space-x-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Watchlist Hits</div>
            <div className="text-lg font-bold text-slate-900 font-mono">{stats.blacklisted_documents} hits</div>
          </div>
        </div>
      </div>

      {/* Recent Screening Table */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-600" />
            <h2 className="font-bold text-sm text-slate-900">Recent Border Screenings</h2>
          </div>
          <button
            onClick={() => setCurrentPage('history')}
            className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center space-x-1 cursor-pointer"
          >
            <span>View Complete Archive</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/75 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Document Type</th>
                <th className="py-3 px-4">Doc Number</th>
                <th className="py-3 px-4">Person Name</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Face Match</th>
                <th className="py-3 px-4">Tampering</th>
                <th className="py-3 px-4">Database</th>
                <th className="py-3 px-4">Decision</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {recentScreenings.map((item) => {
                return (
                  <tr
                    key={item.case_id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => onSelectCase(item.case_id)}
                  >
                    <td className="py-3.5 px-4 font-bold text-blue-700 group-hover:underline">
                      {item.case_id}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-sans">
                      {item.document_type}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {item.document_number}
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 font-sans font-medium">
                      {item.person_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold ${
                          item.risk_score >= 60 ? 'text-red-700' : item.risk_score >= 30 ? 'text-amber-800' : 'text-emerald-700'
                        }`}>
                          {item.risk_score}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {item.face_match_score}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={item.tampering_score >= 50 ? 'text-red-700 font-bold' : 'text-slate-600'}>
                        {item.tampering_score >= 50 ? `DETECTED (${item.tampering_score})` : `LOW (${item.tampering_score})`}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.database_status} />
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge status={item.decision} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCase(item.case_id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-blue-700 hover:text-blue-800 border border-slate-300 text-[11px] font-sans font-semibold transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

