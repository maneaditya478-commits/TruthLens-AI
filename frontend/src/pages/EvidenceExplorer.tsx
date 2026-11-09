import React, { useEffect, useState } from 'react';
import { 
  Compass, 
  Search, 
  ExternalLink, 
  Calendar, 
  Filter, 
  ShieldCheck, 
  RefreshCw,
  Globe
} from 'lucide-react';
import { apiService } from '../api/client';
import { EvidenceItem } from '../types';

interface EvidenceWithClaim extends EvidenceItem {
  claim_text: string;
  claim_category: string;
  report_id: string;
}

export const EvidenceExplorer: React.FC = () => {
  const [evidenceList, setEvidenceList] = useState<EvidenceWithClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');

  useEffect(() => {
    // Load evidence across historical runs
    apiService.getHistory(undefined, 20)
      .then(async (runs) => {
        const fullEvidence: EvidenceWithClaim[] = [];
        for (const runItem of runs.slice(0, 10)) {
          try {
            const report = await apiService.getReport(runItem.id);
            for (const claim of report.claims) {
              for (const ev of claim.evidence_list) {
                fullEvidence.push({
                  ...ev,
                  claim_text: claim.claim_text,
                  claim_category: claim.category,
                  report_id: report.id
                });
              }
            }
          } catch {}
        }
        setEvidenceList(fullEvidence);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredEvidence = evidenceList.filter((item) => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.claim_text.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'ALL' || item.source_type === selectedType;

    return matchesSearch && matchesType;
  });

  const sourceTypes = ['ALL', 'official', 'government', 'academic', 'documentation', 'news', 'web'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Compass className="w-6 h-6 text-cyan-400" />
          <span>Evidence Explorer</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Inspect, filter, and audit live web citations, primary documentation, and publisher dates retrieved via <strong>Tavily Search API</strong>.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111827] border border-slate-800 p-4 rounded-xl">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by source title, URL, snippet keyword, or claim..."
            className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        {/* Source Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 mr-1" />
          {sourceTypes.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                selectedType === t
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Evidence Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-3">
          <RefreshCw className="w-7 h-7 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Aggregating evidence records from database...</p>
        </div>
      ) : filteredEvidence.length === 0 ? (
        <div className="p-12 text-center bg-[#111827] border border-slate-800 rounded-xl text-slate-400 text-xs">
          No evidence records match your search query or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEvidence.map((ev, index) => (
            <div 
              key={index}
              className="bg-[#111827] border border-slate-800 hover:border-slate-700 rounded-xl p-4 space-y-3 transition-colors shadow-md flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                    {ev.source_type || 'web'}
                  </span>
                  {ev.published_date && (
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {ev.published_date}
                    </span>
                  )}
                </div>

                <a 
                  href={ev.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-bold text-sm text-slate-100 hover:text-cyan-400 flex items-start gap-1.5 leading-snug"
                >
                  <span className="flex-1">{ev.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                </a>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {ev.snippet}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="text-slate-500 font-medium">Associated Factual Claim:</div>
                <div className="text-slate-300 font-medium line-clamp-1 italic bg-slate-900/60 p-1.5 rounded border border-slate-800/60">
                  "{ev.claim_text}"
                </div>
                <div className="truncate text-slate-500 font-mono text-[10px]">
                  {ev.url}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
