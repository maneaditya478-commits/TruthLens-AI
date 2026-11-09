import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  XCircle, 
  HelpCircle, 
  Cpu, 
  Layers, 
  Sparkles, 
  Zap,
  TrendingUp,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { apiService } from '../api/client';
import { DashboardStats } from '../types';

interface OverviewDashboardProps {
  onNavigate: (tab: string, reportId?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await apiService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading live verification telemetry...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p className="text-rose-400 mb-4">{error || 'Could not fetch stats'}</p>
        <button 
          onClick={fetchStats}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-[#121028] border border-slate-800 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem Statement 06: Stale AI Answer Detector</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Don't Just Trust AI. <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Verify It.</span>
          </h1>
          <p className="mt-3 text-base text-slate-300 leading-relaxed">
            TruthLens AI decomposes AI answers into atomic factual claims, classifies temporal risk, retrieves live web evidence via <strong>Tavily</strong>, and executes rigorous verification through <strong>Maxim AI Bifrost</strong>.
          </p>

          <div className="mt-6 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('new-verification')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all"
            >
              <span>Launch Verification Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('benchmark')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-sm font-medium transition-all"
            >
              <span>View 22-Claim Benchmark Suite</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Runs */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Runs</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">{stats.total_runs}</div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.total_claims} atomic claims analyzed
          </div>
        </div>

        {/* Avg Freshness Score */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Freshness Score</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">{stats.avg_freshness_score} <span className="text-sm text-slate-400">/ 100</span></div>
          <div className="mt-2 text-xs text-slate-400">
            F = 0.40A + 0.25R + 0.25T + 0.10D
          </div>
        </div>

        {/* Problematic Claims (Stale + Contradicted) */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stale / Refuted</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono">
            {stats.potentially_stale_claims + stats.contradicted_claims}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {stats.potentially_stale_claims} stale, {stats.contradicted_claims} contradicted
          </div>
        </div>

        {/* Bifrost Gateway Telemetry */}
        <div className="bg-[#111827] border border-slate-800 rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Bifrost LLM Tokens</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            {stats.total_tokens_consumed.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Avg Latency: <span className="text-cyan-400 font-mono">{stats.avg_latency_ms}ms</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Status Distribution & Freshness Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Claim Status Distribution (Donut) */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Claim Status Distribution</h3>
              <p className="text-xs text-slate-400">Classification across all processed claims</p>
            </div>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.status_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {stats.status_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F3F4F6' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            {stats.status_distribution.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-400 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Freshness Score Buckets */}
        <div className="lg:col-span-7 bg-[#111827] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Freshness Score Histogram</h3>
              <p className="text-xs text-slate-400">Distribution of claims by composite score bracket</p>
            </div>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.score_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="range" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#06B6D4' }}
                />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 text-center text-xs text-slate-400 font-mono">
            Low (0-40) = Stale/Refuted | Mid (41-75) = Needs Review | High (76-100) = Verified Current
          </div>
        </div>
      </div>

      {/* Charts Row 2: Category Freshness & Recent Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Category Freshness Performance</h3>
          <p className="text-xs text-slate-400 mb-4">Average freshness score by subject category</p>

          <div className="space-y-4">
            {stats.category_freshness.map((cat) => {
              const score = cat.avg_score;
              const color = score >= 75 ? 'bg-emerald-500' : (score >= 40 ? 'bg-amber-500' : 'bg-rose-500');
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-300">{cat.category}</span>
                    <span className="font-mono font-bold text-cyan-400">{cat.avg_score} / 100 ({cat.runs} runs)</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${color}`} 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity & Latency Timeline */}
        <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Verification Activity Timeline</h3>
          <p className="text-xs text-slate-400 mb-4">Runs and claims processed chronologically</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.activity_timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorClaims" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1F2937', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="claims" stroke="#06B6D4" fillOpacity={1} fill="url(#colorClaims)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
