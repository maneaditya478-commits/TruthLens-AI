import React, { useEffect, useState } from 'react';
import { 
  CheckCheck, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Zap, 
  Cpu, 
  BarChart2,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../api/client';
import { BenchmarkItem, BenchmarkRunResult } from '../types';
import { StatusBadge } from '../components/StatusBadge';

export const BenchmarkPage: React.FC = () => {
  const [dataset, setDataset] = useState<BenchmarkItem[]>([]);
  const [loadingDataset, setLoadingDataset] = useState(true);
  
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [sampleSize, setSampleSize] = useState(5);
  const [benchmarkResult, setBenchmarkResult] = useState<BenchmarkRunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiService.getBenchmarkDataset()
      .then(setDataset)
      .catch((err) => console.error(err))
      .finally(() => setLoadingDataset(false));
  }, []);

  const handleRunBenchmark = async () => {
    setError(null);
    setRunningBenchmark(true);
    try {
      const res = await apiService.runBenchmark(sampleSize);
      setBenchmarkResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Benchmark run failed');
    } finally {
      setRunningBenchmark(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckCheck className="w-6 h-6 text-cyan-400" />
            <span>Benchmark & Ground-Truth Evaluation Suite</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            22 manually verified claims across 7 domains to evaluate stale-answer detection precision, recall, and F1.
          </p>
        </div>

        {/* Live Runner Controls */}
        <div className="flex items-center gap-3 bg-[#111827] border border-slate-800 p-2 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Sample:</span>
            <select
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
              disabled={runningBenchmark}
              className="bg-[#0B0F19] border border-slate-800 rounded px-2 py-1 text-cyan-300 font-mono text-xs"
            >
              <option value={3}>3 Claims</option>
              <option value={5}>5 Claims</option>
              <option value={10}>10 Claims</option>
              <option value={22}>All 22 Claims</option>
            </select>
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={runningBenchmark}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all disabled:opacity-50"
          >
            {runningBenchmark ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Execute Benchmark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Benchmark Execution Results */}
      {benchmarkResult && (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Live Benchmark Measurements</span>
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              Completion Rate: {benchmarkResult.summary.completion_rate_pct}%
            </span>
          </div>

          {/* Metric KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Stale Detection Precision
              </span>
              <div className="text-2xl font-extrabold text-cyan-400 font-mono mt-1">
                {(benchmarkResult.summary.stale_detection_precision * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Stale Detection Recall
              </span>
              <div className="text-2xl font-extrabold text-purple-400 font-mono mt-1">
                {(benchmarkResult.summary.stale_detection_recall * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                F1 Score
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-1">
                {benchmarkResult.summary.stale_detection_f1}
              </div>
            </div>

            <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                Avg Latency per Claim
              </span>
              <div className="text-2xl font-extrabold text-white font-mono mt-1">
                {benchmarkResult.summary.avg_latency_ms} <span className="text-xs text-slate-400">ms</span>
              </div>
            </div>
          </div>

          {/* Test results table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Claim Tested</th>
                  <th className="py-2.5 px-3">Expected Ground Truth</th>
                  <th className="py-2.5 px-3">Predicted By Pipeline</th>
                  <th className="py-2.5 px-3">Match</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Sources</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {benchmarkResult.detailed_results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-mono text-cyan-400">{res.id}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-medium max-w-sm">{res.claim_text}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] font-semibold text-slate-300">
                        {res.expected_status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] font-semibold text-cyan-300">
                        {res.predicted_status || 'ERROR'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {res.match ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>MATCH</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>DIFF</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-200">
                      {res.freshness_score !== undefined ? `${res.freshness_score}/100` : '-'}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {res.evidence_count !== undefined ? `${res.evidence_count} urls` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ground Truth Dataset Table */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center justify-between">
            <span>Ground-Truth Labeled Claims (22 Items)</span>
            <span className="text-xs font-mono text-slate-400">Master Test Corpus</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Carefully curated dataset covering software versions, corporate leadership, API pricing, regulations, historical dates, and scientific constants.
          </p>
        </div>

        {loadingDataset ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading test dataset...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Claim Text</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Expected Ground-Truth Status</th>
                  <th className="py-3 px-3">Freshness Risk</th>
                  <th className="py-3 px-3">Ground Truth Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {dataset.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/30">
                    <td className="py-3 px-3 font-mono text-cyan-400 whitespace-nowrap">{item.id}</td>
                    <td className="py-3 px-3 text-slate-200 font-semibold max-w-xs">{item.claim_text}</td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{item.category}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={item.expected_status} size="sm" />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-300">
                      {item.expected_risk}
                    </td>
                    <td className="py-3 px-3 text-slate-400 text-[11px] leading-relaxed max-w-sm">
                      {item.ground_truth_notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
