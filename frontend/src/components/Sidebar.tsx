import React from 'react';
import { 
  LayoutDashboard, 
  FileCheck2, 
  FileText, 
  Compass, 
  History, 
  BarChart3, 
  Settings, 
  CheckCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-verification', label: 'New Verification', icon: FileCheck2, highlight: true },
    { id: 'reports', label: 'Verification Reports', icon: FileText },
    { id: 'evidence-explorer', label: 'Evidence Explorer', icon: Compass },
    { id: 'history', label: 'History', icon: History },
    { id: 'analytics', label: 'Analytics & Telemetry', icon: BarChart3 },
    { id: 'benchmark', label: 'Benchmark & Evaluation', icon: CheckCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#0B0F19] hidden md:flex flex-col justify-between py-6 px-4">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform Navigation
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-purple-500/15 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Hackathon Architecture Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Problem 06: Stale AI</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Detects outdated claims using <strong>Maxim AI Bifrost</strong> inference and <strong>Tavily</strong> live search evidence.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Formula:</span>
            <span className="text-cyan-400 font-bold">0.4A+0.25R+0.25T+0.1D</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-3 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div>TruthLens AI Platform</div>
        <div className="text-[10px] text-slate-400 font-mono mt-0.5">Maxim AI Bifrost + Tavily</div>
      </div>
    </aside>
  );
};
