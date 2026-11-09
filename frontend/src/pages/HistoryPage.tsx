import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  ArrowRight, 
  RefreshCw, 
  ShieldCheck, 
  Tag, 
  FileCheck2 
} from 'lucide-react';
import { apiService } from '../api/client';
import { HistoryListItem } from '../types';

interface HistoryPageProps {
  onSelectReport: (reportId: string) => void;
  onNewVerification: () => void;
}

const CATEGORIES = [
  "All",
  "Technology",
  "Software and APIs",
  "Business",
  "Government and Regulations",
  "Finance",
  "Science and Research",
  "General Knowledge"
];

export const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectReport, onNewVerification }) => {
  const [runs, setRuns] = useState<HistoryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHistory(selectedCategory === 'All' ? undefined : selectedCategory);
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedCategory]);

  const filteredRuns = runs.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSnippet = r.input_snippet.toLowerCase().includes(q);
    const matchesQuestion = r.original_question ? r.original_question.toLowerCase().includes(q) : false;
    return matchesSnippet || matchesQuestion;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-cyan-400" />
            <span>Verification History</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Complete audit trail of previous AI verification runs and freshness assessments.
          </p>
        </div>

        <button
          onClick={onNewVerification}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-md transition-all"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>New Verification</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by input snippet, prompt, or question..."
            className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Table / List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading audit history...</p>
        </div>
      ) : filteredRuns.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-xl text-slate-400 text-xs">
          No verification runs match your current criteria.
        </div>
      ) : (
        <div className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Run ID & Timestamp</th>
                  <th className="py-3.5 px-4">Prompt / Input Snippet</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Mode</th>
                  <th className="py-3.5 px-4">Claims</th>
                  <th className="py-3.5 px-4">Freshness Score</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredRuns.map((run) => {
                  const score = run.overall_score;
                  const scoreColor = score >= 75 ? 'text-emerald-400' : (score >= 40 ? 'text-amber-400' : 'text-rose-400');
                  const scoreBadgeBg = score >= 75 ? 'bg-emerald-500/10 border-emerald-500/20' : (score >= 40 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-rose-500/10 border-rose-500/20');

                  return (
                    <tr 
                      key={run.id}
                      onClick={() => onSelectReport(run.id)}
                      className="hover:bg-slate-900/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-cyan-400">#{run.id.slice(0, 8)}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(run.created_at).toLocaleDateString()} {new Date(run.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                        {run.original_question && (
                          <div className="font-semibold text-slate-200 truncate mb-0.5">
                            {run.original_question}
                          </div>
                        )}
                        <div className="text-slate-400 truncate text-[11px]">
                          "{run.input_snippet}"
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                          {run.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap capitalize text-slate-400">
                        {run.verification_mode}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-200">
                        {run.total_claims}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${scoreBadgeBg} ${scoreColor}`}>
                          {score} / 100
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectReport(run.id);
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold transition-colors"
                        >
                          <span>Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
