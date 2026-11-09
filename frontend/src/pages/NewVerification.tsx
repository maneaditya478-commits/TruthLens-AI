import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  XCircle, 
  HelpCircle,
  Settings,
  Filter,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../api/client';
import { VerificationReport, ClaimStatus } from '../types';
import { ClaimCard } from '../components/ClaimCard';
import { FreshnessScoreGauge } from '../components/FreshnessScoreGauge';

interface NewVerificationProps {
  onNavigate: (tab: string, reportId?: string) => void;
}

const PRESET_SCENARIOS = [
  {
    name: "Master Hackathon Demo Scenario",
    question: "What is the status of Python and XYZ company?",
    category: "Software and APIs",
    text: "Python 3.11 is the latest stable Python version. Company XYZ currently has 10,000 employees. The latest version of Product ABC costs $20 per month."
  },
  {
    name: "Tech Leadership & Historical Facts",
    question: "Who leads Alphabet and when did Python launch?",
    category: "Technology",
    text: "OpenAI released GPT-4 in March 2023. Sundar Pichai is the CEO of Alphabet Inc. Guido van Rossum first released Python in 1991."
  },
  {
    name: "Outdated OS & Political Figures",
    question: "Check Windows 7 and UK prime minister",
    category: "Government and Regulations",
    text: "Windows 7 is currently Microsoft's active flagship OS with full security patches. Boris Johnson is currently the UK Prime Minister."
  }
];

const CATEGORIES = [
  "Technology",
  "Software and APIs",
  "Business",
  "Government and Regulations",
  "Finance",
  "Science and Research",
  "General Knowledge",
  "Custom"
];

export const NewVerification: React.FC<NewVerificationProps> = ({ onNavigate }) => {
  const [inputText, setInputText] = useState(PRESET_SCENARIOS[0].text);
  const [question, setQuestion] = useState(PRESET_SCENARIOS[0].question);
  const [category, setCategory] = useState(PRESET_SCENARIOS[0].category);
  const [mode, setMode] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [report, setReport] = useState<VerificationReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const handlePresetSelect = (preset: typeof PRESET_SCENARIOS[0]) => {
    setInputText(preset.text);
    setQuestion(preset.question);
    setCategory(preset.category);
    setFile(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
    }
  };

  const handleVerify = async () => {
    setError(null);
    setReport(null);
    setLoading(true);
    setActiveStep(1); // 1: Extracting claims

    try {
      // Step simulation for visual feedback while awaiting async backend pipeline
      const stepTimer1 = setTimeout(() => setActiveStep(2), 1500); // 2: Tavily evidence retrieval
      const stepTimer2 = setTimeout(() => setActiveStep(3), 3200); // 3: Bifrost LLM evaluation & scoring

      let result: VerificationReport;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (question) formData.append('original_question', question);
        formData.append('category', category);
        formData.append('verification_mode', mode);
        result = await apiService.verifyFile(formData);
      } else {
        if (!inputText.trim()) {
          throw new Error('Please enter an AI-generated answer or upload a file.');
        }
        result = await apiService.verifyText({
          input_text: inputText,
          original_question: question || undefined,
          category,
          verification_mode: mode
        });
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setActiveStep(4);
      setReport(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Verification pipeline encountered an error.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredClaims = report?.claims.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.evaluation?.status === filterStatus;
  }) || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Workspace Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <span>AI Answer Verification Workspace</span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            End-to-End Pipeline
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Deconstruct AI responses, extract factual claims, query <strong>Tavily</strong> live search, and analyze staleness via <strong>Maxim AI Bifrost</strong>.
        </p>
      </div>

      {/* Preset Scenario Quick-Fill Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Quick Test Presets:
        </span>
        {PRESET_SCENARIOS.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetSelect(p)}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-cyan-300 font-medium transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Grid: Left Input Workspace vs Right Verification Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-5 bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 border-b border-slate-800 pb-3">
            Input Configuration
          </h3>

          {/* AI-Generated Answer Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>AI-Generated Response to Verify:</span>
              <span className="text-[11px] text-slate-400 font-normal">
                {inputText.length} characters
              </span>
            </label>
            <textarea
              rows={7}
              disabled={loading}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setFile(null);
              }}
              placeholder="Paste the AI-generated answer here..."
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono leading-relaxed"
            />
          </div>

          {/* File Upload Alternative (TXT / PDF) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or Upload Document (TXT / PDF):</span>
            </label>
            <div className="relative border border-dashed border-slate-800 hover:border-slate-700 rounded-xl p-3 bg-slate-900/40 text-center">
              <input
                type="file"
                accept=".txt,.pdf"
                onChange={handleFileUpload}
                disabled={loading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-xs text-cyan-400 font-semibold">
                  <FileText className="w-4 h-4" />
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
              ) : (
                <div className="text-xs text-slate-400">
                  Click or drag TXT / PDF document here (max 5MB)
                </div>
              )}
            </div>
          </div>

          {/* Original Question (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Original Prompt / Question (Optional context):
            </label>
            <input
              type="text"
              disabled={loading}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What is the latest stable version of Python?"
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Verification Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={loading}
              className="w-full bg-[#0B0F19] border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Verification Depth Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Verification Depth Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['quick', 'standard', 'deep'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  disabled={loading}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize transition-all border ${
                    mode === m 
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm' 
                      : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m === 'quick' ? 'Quick Scan' : (m === 'standard' ? 'Standard' : 'Deep (15 Claims)')}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleVerify}
            disabled={loading || (!inputText && !file)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running TruthLens AI Verification...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Verify with TruthLens AI</span>
              </>
            )}
          </button>
        </div>

        {/* Right Panel: Results & Pipeline Tracker */}
        <div className="lg:col-span-7 space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Verification Warning / Error</span>
              </div>
              <p className="leading-relaxed">{error}</p>
              {error.includes('configured') && (
                <button
                  onClick={() => onNavigate('settings')}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-semibold"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure API Keys in Settings</span>
                </button>
              )}
            </div>
          )}

          {/* Loading Pipeline Stepper */}
          {loading && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl animate-pulse">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Verification Pipeline in Progress</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400">Step {activeStep} of 4</span>
              </div>

              <div className="space-y-4">
                {[
                  { step: 1, title: "Claim Extraction & Freshness Risk Analysis", desc: "Parsing atomic claims and assessing time-decay risks via Maxim AI Bifrost..." },
                  { step: 2, title: "Tavily Live Web Evidence Retrieval", desc: "Searching live web sources, authoritative documentation, and official domains..." },
                  { step: 3, title: "Evidence Comparison & Mathematical Scoring", desc: "Executing F = 0.40A + 0.25R + 0.25T + 0.10D against retrieved snippets..." },
                  { step: 4, title: "Report Generation & Correction Synthesis", desc: "Synthesizing evidence citations and automatic correction suggestions..." }
                ].map((s) => {
                  const isDone = activeStep > s.step;
                  const isCurrent = activeStep === s.step;
                  return (
                    <div key={s.step} className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isDone ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                        (isCurrent ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 animate-bounce' : 'bg-slate-800 text-slate-500')
                      }`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <div>
                        <div className={`text-xs font-bold ${isCurrent ? 'text-cyan-300' : (isDone ? 'text-slate-200' : 'text-slate-500')}`}>
                          {s.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {s.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results State */}
          {report && !loading && (
            <div className="space-y-6">
              {/* Overall Report Score Card */}
              <div className="bg-gradient-to-r from-slate-900 via-[#111827] to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                      Verification Complete
                    </span>
                    <h3 className="text-xl font-extrabold text-white">
                      Overall Freshness Assessment
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Report ID: <span className="font-mono text-slate-300">{report.id.slice(0, 8)}</span> | Analyzed {report.total_claims} factual claims
                    </p>
                  </div>

                  <FreshnessScoreGauge score={report.overall_score} size="lg" />
                </div>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827] p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
                  {[
                    { id: 'ALL', label: 'All Claims', count: report.claims.length },
                    { id: 'VERIFIED', label: 'Verified', count: report.claims.filter(c => c.evaluation?.status === 'VERIFIED').length },
                    { id: 'POTENTIALLY_STALE', label: 'Stale', count: report.claims.filter(c => c.evaluation?.status === 'POTENTIALLY_STALE').length },
                    { id: 'CONTRADICTED', label: 'Contradicted', count: report.claims.filter(c => c.evaluation?.status === 'CONTRADICTED').length },
                    { id: 'UNVERIFIED', label: 'Unverified', count: report.claims.filter(c => c.evaluation?.status === 'UNVERIFIED').length },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilterStatus(tab.id)}
                      className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                        filterStatus === tab.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Individual Claim Cards */}
              <div className="space-y-4">
                {filteredClaims.length === 0 ? (
                  <div className="p-8 text-center bg-[#111827] rounded-xl border border-slate-800 text-slate-400 text-xs">
                    No claims match the selected filter status.
                  </div>
                ) : (
                  filteredClaims.map((claim, idx) => (
                    <ClaimCard key={claim.id || idx} claim={claim} index={idx} />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Empty Initial State Prompt */}
          {!report && !loading && !error && (
            <div className="bg-[#111827] border border-slate-800 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ready to Verify</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Paste an AI-generated answer or click one of the quick presets on the left. TruthLens AI will analyze every claim against live web facts in real time.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
