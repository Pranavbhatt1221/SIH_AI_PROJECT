import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ScanFace,
  Eye,
  Clock,
  RefreshCw
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from 'recharts';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center text-xs font-mono text-blue-700">
        Loading Verification Analytics...
      </div>
    );
  }

  const { stats, charts } = data;

  const verifiedPercent = stats.total_screened > 0 ? Math.round((stats.verified / stats.total_screened) * 100) : 0;
  const reviewPercent = stats.total_screened > 0 ? Math.round((stats.review_required / stats.total_screened) * 100) : 0;
  const failedPercent = stats.total_screened > 0 ? Math.round((stats.failed / stats.total_screened) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
            <BarChart3 className="w-4 h-4" />
            <span>Operational Statistics</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Border Screening Analytics</h1>
          <p className="text-xs text-slate-500">
            Real-time biometric verification, optical tampering detection, and credential decision metrics.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 transition-all self-start cursor-pointer shadow-sm"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4 text-blue-700" />
        </button>
      </div>

      {/* Percentage Rate Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-slate-200 p-4 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-slate-500">Total Inspections</div>
          <div className="text-2xl font-black text-slate-900 font-mono">{stats.total_screened}</div>
          <div className="text-[10px] text-blue-700 font-medium">100% Processed</div>
        </div>

        <div className="rounded-xl bg-white border border-emerald-200 p-4 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-emerald-800">Verified Rate</div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{verifiedPercent}%</div>
          <div className="text-[10px] text-slate-500">{stats.verified} Cleared Credentials</div>
        </div>

        <div className="rounded-xl bg-white border border-amber-200 p-4 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-amber-800">Review Rate</div>
          <div className="text-2xl font-black text-amber-700 font-mono">{reviewPercent}%</div>
          <div className="text-[10px] text-slate-500">{stats.review_required} Secondary Referrals</div>
        </div>

        <div className="rounded-xl bg-white border border-red-200 p-4 space-y-1 shadow-sm">
          <div className="text-[10px] uppercase font-bold text-red-800">Denial / Fail Rate</div>
          <div className="text-2xl font-black text-red-700 font-mono">{failedPercent}%</div>
          <div className="text-[10px] text-slate-500">{stats.failed} Prohibited Crossings</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Risk Distribution (Donut Chart) */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Risk Tier Distribution</h3>
            <span className="text-[10px] text-slate-500 font-mono">ALL CASES</span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Officer Final Determinations */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Screening Outcomes</h3>
            <span className="text-[10px] text-slate-500 font-mono">DECISIONS</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.screening_results}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Tampering Categories */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Tampering & Forgery Categories Detected</h3>
            <span className="text-[10px] text-amber-700 font-mono">CV / ELA</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.tampering_breakdown} layout="vertical">
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis type="category" dataKey="category" stroke="#64748B" fontSize={11} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="cases" fill="#D97706" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Daily Screening Volume Trend */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Daily Screening Volume Trend</h3>
            <span className="text-[10px] text-blue-700 font-mono">7-DAY TIMELINE</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.volume_trends}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '11px', color: '#0F172A', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="volume" stroke="#1D4ED8" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                <Area type="monotone" dataKey="flagged" stroke="#DC2626" strokeWidth={1.5} fillOpacity={0.15} fill="#DC2626" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
