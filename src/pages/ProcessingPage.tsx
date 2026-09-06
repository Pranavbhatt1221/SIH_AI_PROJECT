import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  CheckCircle2,
  Loader2,
  Scan,
  FileSearch,
  Eye,
  ScanFace,
  Database,
  ShieldAlert,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  XCircle
} from 'lucide-react';
import { PageView, AnalysisResult } from '../types';

interface ProcessingPageProps {
  analysisPayload: any;
  onAnalysisComplete: (result: AnalysisResult) => void;
  setCurrentPage: (page: PageView) => void;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  analysisPayload,
  onAnalysisComplete,
  setCurrentPage
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);
  const [apiResult, setApiResult] = useState<AnalysisResult | null>(null);
  const [statusMessage, setStatusMessage] = useState('Initializing AI screening microservices...');
  const [errorInfo, setErrorInfo] = useState<{ error: string; message: string } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const pipelineSteps = [
    { name: "Image Quality Assessment (IQA)", detail: "Resolution, blur, contrast, and framing analysis", icon: Scan },
    { name: "PaddleOCR & MRZ Extraction", detail: "Deep text line detection and ICAO 9303 check digit math", icon: FileSearch },
    { name: "Document Validation Engine", detail: "Evaluating document schema, validity dates, and format", icon: CheckCircle2 },
    { name: "AI Tampering Detection (ELA)", detail: "Error Level Analysis, substrate noise disparity, and boundary splicing", icon: Eye },
    { name: "InsightFace Biometric Verification", detail: "ArcFace 512-D landmark alignment and anti-spoofing liveness", icon: ScanFace },
    { name: "Authorized Database Query", detail: "Cross-referencing civil registry, visas, and Interpol watchlists", icon: Database },
    { name: "Multi-Modal Risk Assessment", detail: "Weighted composite risk calculation and explainability generation", icon: ShieldAlert }
  ];

  // Primary screening caller with retry capability
  const executeScreening = useCallback(async () => {
    setErrorInfo(null);
    setIsRetrying(true);
    setCurrentStepIndex(0);
    setProgress(15);
    setStatusMessage('Initiating neural models and optical computer vision engines...');

    try {
      const res = await fetch('/api/screening/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisPayload || {})
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Corrupted image error or decode failure
        setErrorInfo({
          error: data.error || 'CORRUPTED_IMAGE',
          message: data.message || 'The uploaded credential image is damaged, corrupted, or could not be decoded.'
        });
        setStatusMessage('Screening halted: Corrupted image stream detected.');
        return;
      }

      if (data.analysis) {
        setApiResult(data.analysis);
      }
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setErrorInfo({
        error: 'NETWORK_ERROR',
        message: err.message || 'Unable to connect to AI screening microservices. Please verify server connectivity.'
      });
      setStatusMessage('Screening halted: Network or service communication error.');
    } finally {
      setIsRetrying(false);
    }
  }, [analysisPayload]);

  // Initial execution on mount
  useEffect(() => {
    executeScreening();
  }, [executeScreening]);

  // Step ticker animation while processing
  useEffect(() => {
    if (errorInfo) return;

    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < pipelineSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 95) return prev + 12;
        return 98;
      });
    }, 280);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [errorInfo, isRetrying]);

  // When steps finish and API result is in, navigate smoothly to Officer Analysis
  useEffect(() => {
    if (!errorInfo && currentStepIndex >= pipelineSteps.length - 1 && apiResult) {
      setProgress(100);
      setStatusMessage('Analysis Complete! Generating Officer Forensic Report...');
      const timeout = setTimeout(() => {
        onAnalysisComplete(apiResult);
        setCurrentPage('officer_analysis');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, apiResult, errorInfo, onAnalysisComplete, setCurrentPage]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      {/* Top Animation & Ticker */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-10 h-10 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold mb-2">
            <Sparkles className="w-3 h-3" />
            <span>RUNNING PARALLEL AI ANALYSIS PIPELINE</span>
          </div>
          <h2 className="text-2xl font-black text-white">Screening Identity Credential</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">{statusMessage}</p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-md mx-auto space-y-1.5">
          <div className="w-full bg-navy-850 h-2.5 rounded-full overflow-hidden border border-navy-750">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-sm shadow-cyan-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>MODELS ACTIVE: 7</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Corrupted Image Error Fallback Card */}
      {errorInfo && (
        <div className="rounded-2xl border border-red-500/50 bg-gradient-to-b from-red-950/70 to-navy-950 p-6 md:p-8 shadow-2xl shadow-red-500/10 space-y-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 mx-auto">
            <AlertTriangle className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold">
              <XCircle className="w-3.5 h-3.5" />
              <span>SCREENING HALTED • {errorInfo.error}</span>
            </div>
            <h3 className="text-xl font-bold text-white">
              Corrupted or Unreadable Image Stream
            </h3>
            <p className="text-xs text-red-200/80 leading-relaxed font-sans">
              {errorInfo.message}
            </p>
            <p className="text-[11px] text-slate-400 font-mono pt-1">
              The optical decoders could not construct valid pixel arrays from the input payload. Please retry or upload an uncorrupted JPEG/PNG image.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => executeScreening()}
              disabled={isRetrying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-400 hover:to-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-red-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying Screening...' : 'Try Again (Retry Screening)'}</span>
            </button>

            <button
              onClick={() => setCurrentPage('new_screening')}
              className="px-5 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-700 text-slate-200 font-bold text-xs flex items-center space-x-2 cursor-pointer transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Re-upload Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Steps Cards */}
      <div className="rounded-xl bg-navy-900 border border-navy-750 divide-y divide-navy-800/80 overflow-hidden shadow-xl">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIndex || progress === 100;
          const isCurrent = idx === currentStepIndex && progress < 100;

          return (
            <div
              key={step.name}
              className={`p-4 flex items-center justify-between transition-colors ${
                isCurrent
                  ? 'bg-cyan-500/10 text-white'
                  : isDone
                  ? 'bg-navy-900/40 text-slate-300'
                  : 'bg-navy-950/20 text-slate-500 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isCurrent
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-navy-800 text-slate-500'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-2">
                    <span>{step.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] text-cyan-400 font-mono font-bold animate-pulse">
                        [PROCESSING...]
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{step.detail}</div>
                </div>
              </div>

              <div>
                {isDone ? (
                  <span className="flex items-center space-x-1 text-emerald-400 text-xs font-bold font-mono">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">PASSED</span>
                  </span>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-600">PENDING</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
