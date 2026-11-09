import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Cpu, 
  Search, 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Key, 
  Globe, 
  Eye, 
  EyeOff 
} from 'lucide-react';
import { apiService } from '../api/client';
import { SettingsState } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>({
    bifrost_base_url: 'https://api.bifrost.maxim.ai/v1',
    bifrost_model: 'gpt-4o-mini',
    bifrost_fallback_model: 'claude-3-5-haiku',
    bifrost_key_configured: false,
    tavily_key_configured: false,
    environment: 'development'
  });

  const [bifrostKey, setBifrostKey] = useState('');
  const [tavilyKey, setTavilyKey] = useState('');
  const [showBifrostKey, setShowBifrostKey] = useState(false);
  const [showTavilyKey, setShowTavilyKey] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [testingBifrost, setTestingBifrost] = useState(false);
  const [bifrostTestResult, setBifrostTestResult] = useState<any>(null);

  const [testingTavily, setTestingTavily] = useState(false);
  const [tavilyTestResult, setTavilyTestResult] = useState<any>(null);

  useEffect(() => {
    apiService.getSettings()
      .then(setSettings)
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await apiService.updateSettings({
        bifrost_base_url: settings.bifrost_base_url,
        bifrost_model: settings.bifrost_model,
        bifrost_api_key: bifrostKey.trim() ? bifrostKey.trim() : undefined,
        tavily_api_key: tavilyKey.trim() ? tavilyKey.trim() : undefined,
      });
      setSettings(updated);
      setSaveSuccess(true);
      if (bifrostKey.trim()) setBifrostKey('');
      if (tavilyKey.trim()) setTavilyKey('');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTestBifrost = async () => {
    setTestingBifrost(true);
    setBifrostTestResult(null);
    try {
      const res = await apiService.testBifrost();
      setBifrostTestResult(res);
    } catch (err: any) {
      setBifrostTestResult({ connected: false, error: err.message });
    } finally {
      setTestingBifrost(false);
    }
  };

  const handleTestTavily = async () => {
    setTestingTavily(true);
    setTavilyTestResult(null);
    try {
      const res = await apiService.testTavily();
      setTavilyTestResult(res);
    } catch (err: any) {
      setTavilyTestResult({ connected: false, error: err.message });
    } finally {
      setTestingTavily(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-cyan-400" />
          <span>System Settings & API Gateways</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configure connectivity to <strong>Maxim AI Bifrost Gateway</strong> and <strong>Tavily Search API</strong>.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Settings saved and updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Module 5: Bifrost Gateway Configuration Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Bifrost AI Gateway (Maxim AI)
                </h3>
                <p className="text-[11px] text-slate-400">OpenAI-compatible inference routing & model management</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                settings.bifrost_key_configured 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {settings.bifrost_key_configured ? 'API Key Configured' : 'Key Missing'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Bifrost Gateway Base URL:
              </label>
              <input
                type="text"
                value={settings.bifrost_base_url}
                onChange={(e) => setSettings({ ...settings, bifrost_base_url: e.target.value })}
                placeholder="https://api.bifrost.maxim.ai/v1 or http://localhost:8080/v1"
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Primary Model (OpenAI / Claude / Gemini / Open-source):
              </label>
              <input
                type="text"
                value={settings.bifrost_model}
                onChange={(e) => setSettings({ ...settings, bifrost_model: e.target.value })}
                placeholder="gpt-4o-mini"
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Bifrost API Key:</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {settings.bifrost_key_configured ? '●●●●●●●● (Stored in Backend)' : 'Not Set'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showBifrostKey ? "text" : "password"}
                value={bifrostKey}
                onChange={(e) => setBifrostKey(e.target.value)}
                placeholder={settings.bifrost_key_configured ? "Enter new key to update..." : "Enter your Bifrost API Key..."}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-3.5 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowBifrostKey(!showBifrostKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showBifrostKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Bifrost Connection */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleTestBifrost}
              disabled={testingBifrost}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-purple-400 hover:text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {testingBifrost ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Cpu className="w-3.5 h-3.5" />}
              <span>Test Bifrost Gateway Ping</span>
            </button>

            {bifrostTestResult && (
              <div className="text-xs font-mono">
                {bifrostTestResult.connected ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Ping OK ({bifrostTestResult.latency_ms}ms) - Model: {bifrostTestResult.active_model}</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Failed: {bifrostTestResult.error || bifrostTestResult.message}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Module 4: Tavily Search Configuration Card */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Tavily Live Web Search API
                </h3>
                <p className="text-[11px] text-slate-400">Live evidence retrieval, snippet extraction & date metadata</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                settings.tavily_key_configured 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}>
                {settings.tavily_key_configured ? 'API Key Configured' : 'Key Missing'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Tavily API Key (tvly-...):</span>
              <span className="text-[10px] text-slate-500 font-mono">
                {settings.tavily_key_configured ? '●●●●●●●● (Stored in Backend)' : 'Not Set'}
              </span>
            </label>
            <div className="relative">
              <input
                type={showTavilyKey ? "text" : "password"}
                value={tavilyKey}
                onChange={(e) => setTavilyKey(e.target.value)}
                placeholder={settings.tavily_key_configured ? "Enter new key to update..." : "Enter your Tavily API Key (tvly-...)"}
                className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg pl-3.5 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowTavilyKey(!showTavilyKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showTavilyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Test Tavily Connection */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handleTestTavily}
              disabled={testingTavily}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {testingTavily ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>Test Tavily Live Search</span>
            </button>

            {tavilyTestResult && (
              <div className="text-xs font-mono">
                {tavilyTestResult.connected ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Search OK - Retrieved source: {tavilyTestResult.sample_title}</span>
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Failed: {tavilyTestResult.error || tavilyTestResult.message}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
