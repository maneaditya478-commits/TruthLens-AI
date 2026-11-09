import React, { useEffect, useState } from 'react';
import { 
  ArrowLeft, 
  RefreshCw, 
  Calendar, 
  Tag, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { apiService } from '../api/client';
import { VerificationReport } from '../types';
import { ClaimCard } from '../components/ClaimCard';
import { FreshnessScoreGauge } from '../components/FreshnessScoreGauge';

interface ReportDetailProps {
  reportId?: string;
  onBack: () => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ reportId, onBack }) => {
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reportId) {
      setError("No report ID provided.");
      setLoading(false);
      return;
    }

    setLoading(true);
    apiService.getReport(reportId)
      .then((data) => {
        setReport(data);
        setError(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.detail || err.message || "Failed to load report");
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleCopySummary = () => {
    if (!report) return;
    const summary = `TruthLens AI Verification Report:
Report ID: ${report.id}
Overall Freshness Score: ${report.overall_score}/100
Category: ${report.category}
Claims Evaluated: ${report.total_claims}
Answer Analyzed: "${report.input_text}"
`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm text-slate-400">Loading verification report telemetry...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-rose-400 text-sm">{error || "Report not found"}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to History</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar with Back Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to History</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Summary'}</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                REPORT #{report.id.slice(0, 8)}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Tag className="w-3 h-3 text-cyan-500" />
                {report.category}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {new Date(report.created_at).toLocaleString()}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {report.original_question || "AI Response Verification"}
            </h1>

            <div className="text-xs text-slate-300 bg-[#0B0F19] p-3 rounded-lg border border-slate-800 font-mono">
              <span className="text-slate-500 uppercase tracking-wider block mb-1 text-[10px]">Analyzed Input:</span>
              "{report.input_text}"
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Overall Freshness
            </span>
            <FreshnessScoreGauge score={report.overall_score} size="lg" />
          </div>
        </div>

        {/* Bifrost Gateway Telemetry Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Claims Evaluated</span>
            <span className="text-white font-bold text-base">{report.total_claims}</span>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Bifrost LLM Calls</span>
            <span className="text-purple-400 font-bold text-base">{report.model_usages.length}</span>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Tokens Consumed</span>
            <span className="text-cyan-400 font-bold text-base">
              {report.model_usages.reduce((acc, u) => acc + u.input_tokens + u.output_tokens, 0)}
            </span>
          </div>

          <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-800">
            <span className="text-slate-500 block text-[10px] uppercase">Avg Latency</span>
            <span className="text-emerald-400 font-bold text-base">
              {report.model_usages.length > 0 
                ? (report.model_usages.reduce((acc, u) => acc + u.latency_ms, 0) / report.model_usages.length).toFixed(1) + 'ms'
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Claim Cards Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white flex items-center justify-between">
          <span>Detailed Claim Verification Breakdown</span>
          <span className="text-xs font-normal text-slate-400 font-mono">{report.claims.length} Claims</span>
        </h3>

        {report.claims.map((claim, idx) => (
          <ClaimCard key={claim.id || idx} claim={claim} index={idx} />
        ))}
      </div>
    </div>
  );
};
