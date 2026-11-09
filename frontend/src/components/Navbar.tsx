import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Cpu, 
  Activity, 
  Settings as SettingsIcon,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../api/client';
import { SettingsState } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const [settings, setSettings] = useState<SettingsState | null>(null);

  useEffect(() => {
    apiService.getSettings()
      .then(setSettings)
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab('overview')}
            className="flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 shadow-lg shadow-cyan-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                  TruthLens AI
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                "Don't Just Trust AI. Verify It."
              </p>
            </div>
          </button>
        </div>

        {/* Integration Status Badges */}
        <div className="hidden md:flex items-center gap-3">
          {/* Bifrost Gateway Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400">Bifrost Gateway:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${settings?.bifrost_key_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings?.bifrost_key_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {settings?.bifrost_key_configured ? 'Online' : 'Configure Key'}
            </span>
          </div>

          {/* Tavily Live Search Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Tavily Live Web:</span>
            <span className={`inline-flex items-center gap-1 font-semibold ${settings?.tavily_key_configured ? 'text-emerald-400' : 'text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${settings?.tavily_key_configured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {settings?.tavily_key_configured ? 'Ready' : 'Configure Key'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentTab('new-verification')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Verification</span>
          </button>

          <button
            onClick={() => setCurrentTab('settings')}
            className={`p-2 rounded-lg border transition-colors ${
              currentTab === 'settings' 
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
