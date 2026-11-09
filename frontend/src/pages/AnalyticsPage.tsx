import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Cpu, 
  Zap, 
  Activity, 
  Layers, 
  RefreshCw, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';
import { apiService } from '../api/client';

export const AnalyticsPage: React.FC = () => {
  const [usage, setUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await apiService.getUsageMetrics();
      setUsage(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          <span>Bifrost AI Gateway Analytics & Telemetry</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Real-time metrics on LLM inference routing, token consumption, and gateway response latency via <strong>Maxim AI Bifrost</strong>.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="w-7 h-7 text-purple-400 animate-spin" />
          <p className="text-xs text-slate-400">Querying gateway telemetry...</p>
        </div>
      ) : !usage ? (
        <div className="p-8 text-center text-slate-400 text-xs">Could not load usage data.</div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Total Bifrost Calls</span>
                <Cpu className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">{usage.total_calls}</div>
              <div className="mt-2 text-xs text-slate-400">Gateway Status: <span className="text-emerald-400 font-semibold">{usage.gateway_status}</span></div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Input Tokens</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-400 font-mono">{usage.total_input_tokens.toLocaleString()}</div>
              <div className="mt-2 text-xs text-slate-400">Prompt & system instructions</div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Output Tokens</span>
                <Layers className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-purple-400 font-mono">{usage.total_output_tokens.toLocaleString()}</div>
              <div className="mt-2 text-xs text-slate-400">Claims & evaluation responses</div>
            </div>

            <div className="bg-[#111827] border border-slate-800 rounded-xl p-5">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-medium uppercase tracking-wider">Avg Gateway Latency</span>
                <Clock className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-400 font-mono">{usage.avg_latency_ms} <span className="text-xs text-slate-400">ms</span></div>
              <div className="mt-2 text-xs text-slate-400">Active model: <span className="text-slate-300 font-mono">{usage.active_model}</span></div>
            </div>
          </div>

          {/* Recent Bifrost Gateway Calls Table */}
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Recent Bifrost Gateway Dispatches
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time audit log of LLM requests dispatched through the centralized gateway
            </p>

            {usage.recent_calls.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No recent model calls recorded in database yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Call ID</th>
                      <th className="py-3 px-4">Routed Model</th>
                      <th className="py-3 px-4">Provider</th>
                      <th className="py-3 px-4">Input Tokens</th>
                      <th className="py-3 px-4">Output Tokens</th>
                      <th className="py-3 px-4">Latency</th>
                      <th className="py-3 px-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono">
                    {usage.recent_calls.map((call: any) => (
                      <tr key={call.id} className="hover:bg-slate-900/40">
                        <td className="py-3 px-4 text-cyan-400">#{call.id.slice(0, 8)}</td>
                        <td className="py-3 px-4 text-white font-bold">{call.model_name}</td>
                        <td className="py-3 px-4 text-purple-300">{call.provider}</td>
                        <td className="py-3 px-4 text-slate-300">{call.input_tokens}</td>
                        <td className="py-3 px-4 text-slate-300">{call.output_tokens}</td>
                        <td className="py-3 px-4 text-emerald-400">{call.latency_ms}ms</td>
                        <td className="py-3 px-4 text-right text-slate-500 text-[11px]">
                          {call.created_at ? new Date(call.created_at).toLocaleTimeString() : 'Recent'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
