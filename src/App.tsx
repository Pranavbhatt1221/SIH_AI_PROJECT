import React, { useState } from 'react';
import { PageView, AnalysisResult } from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewScreeningPage } from './pages/NewScreeningPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { OfficerAnalysisPage } from './pages/OfficerAnalysisPage';
import { DatabasePage } from './pages/DatabasePage';
import { HistoryPage } from './pages/HistoryPage';
import { AuditPage } from './pages/AuditPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>('landing');
  const [activeAnalysis, setActiveAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisPayload, setAnalysisPayload] = useState<any | null>(null);

  const handleStartAnalysis = (payload: any) => {
    setAnalysisPayload(payload);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setActiveAnalysis(result);
  };

  const handleSelectCase = async (caseId: string) => {
    // When clicking a case in dashboard or history, run simulated analysis or load case
    try {
      const res = await fetch(`/api/screening/case/${caseId}`);
      const data = await res.json();
      if (data.success && data.case) {
        // Build analysis view from case
        const c = data.case;
        // Determine demo ID mapping if applicable
        let demoId = "CASE_1";
        if (c.document_number === "P2345678") demoId = "CASE_2";
        else if (c.document_number === "P3456789") demoId = "CASE_3";
        else if (c.document_number === "P4567890") demoId = "CASE_4";
        else if (c.document_number === "P9876543") demoId = "CASE_5";

        const analyzeRes = await fetch('/api/screening/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demo_case_id: demoId })
        });
        const analyzeData = await analyzeRes.json();
        if (analyzeData.success && analyzeData.analysis) {
          analyzeData.analysis.case_id = c.case_id;
          setActiveAnalysis(analyzeData.analysis);
          setCurrentPage('officer_analysis');
        }
      }
    } catch (err) {
      console.error('Error loading case details', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <div className="flex-1 flex overflow-hidden">
        {/* Only hide sidebar on initial landing page if desired, or keep it accessible */}
        {currentPage !== 'landing' && (
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentPage === 'landing' && (
            <LandingPage
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'dashboard' && (
            <DashboardPage
              setCurrentPage={setCurrentPage}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentPage === 'new_screening' && (
            <NewScreeningPage
              setCurrentPage={setCurrentPage}
              onStartAnalysis={handleStartAnalysis}
            />
          )}

          {currentPage === 'processing' && (
            <ProcessingPage
              analysisPayload={analysisPayload}
              onAnalysisComplete={handleAnalysisComplete}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'officer_analysis' && activeAnalysis && (
            <OfficerAnalysisPage
              analysis={activeAnalysis}
              setCurrentPage={setCurrentPage}
              onSelectCase={handleSelectCase}
            />
          )}

          {currentPage === 'database' && <DatabasePage />}

          {currentPage === 'history' && (
            <HistoryPage
              onSelectCase={handleSelectCase}
              setCurrentPage={setCurrentPage}
            />
          )}

          {currentPage === 'audit' && <AuditPage />}

          {currentPage === 'analytics' && <AnalyticsPage />}

          {currentPage === 'settings' && <SettingsPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
