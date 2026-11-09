import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { OverviewDashboard } from './pages/OverviewDashboard';
import { NewVerification } from './pages/NewVerification';
import { ReportDetail } from './pages/ReportDetail';
import { EvidenceExplorer } from './pages/EvidenceExplorer';
import { HistoryPage } from './pages/HistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [activeReportId, setActiveReportId] = useState<string | undefined>(undefined);

  const handleNavigate = (tab: string, reportId?: string) => {
    if (reportId) {
      setActiveReportId(reportId);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectReport = (reportId: string) => {
    setActiveReportId(reportId);
    setCurrentTab('report-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
          {currentTab === 'overview' && (
            <OverviewDashboard onNavigate={handleNavigate} />
          )}

          {currentTab === 'new-verification' && (
            <NewVerification onNavigate={handleNavigate} />
          )}

          {currentTab === 'reports' && (
            <HistoryPage 
              onSelectReport={handleSelectReport} 
              onNewVerification={() => setCurrentTab('new-verification')} 
            />
          )}

          {currentTab === 'report-detail' && (
            <ReportDetail 
              reportId={activeReportId} 
              onBack={() => setCurrentTab('history')} 
            />
          )}

          {currentTab === 'evidence-explorer' && (
            <EvidenceExplorer />
          )}

          {currentTab === 'history' && (
            <HistoryPage 
              onSelectReport={handleSelectReport} 
              onNewVerification={() => setCurrentTab('new-verification')} 
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsPage />
          )}

          {currentTab === 'benchmark' && (
            <BenchmarkPage />
          )}

          {currentTab === 'settings' && (
            <SettingsPage />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
