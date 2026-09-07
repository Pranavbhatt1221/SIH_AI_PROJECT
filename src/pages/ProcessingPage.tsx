import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Loader2,
  Scan,
  FileSearch,
  Eye,
  ScanFace,
  Database,
  ShieldAlert,
  ShieldCheck,
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
  const [statusMessage, setStatusMessage] = useState('Initializing credential verification modules...');
  const [errorInfo, setErrorInfo] = useState<{ error: string; message: string } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const pipelineSteps = [
    { name: "Image Quality Assessment (IQA)", detail: "Resolution, clarity, contrast, and framing analysis", icon: Scan },
    { name: "OCR & MRZ Extraction", detail: "Biographical text parsing and ICAO 9303 check digit calculation", icon: FileSearch },
    { name: "Document Structure & Checksum", detail: "Evaluating document schema, validity dates, and format", icon: CheckCircle2 },
    { name: "Forensic Tampering & ELA", detail: "Error Level Analysis, compression artifacts, and edge disparity", icon: Eye },
    { name: "Biometric Facial Verification", detail: "Facial landmark detection, alignment, and 1:1 cosine matching", icon: ScanFace },
    { name: "Authorized Registry Query", detail: "Cross-referencing civil registry, visas, and watchlist records", icon: Database },
    { name: "Composite Risk Calculation", detail: "Weighted decision scoring and automated explainability generation", icon: ShieldAlert }
  ];

  // Primary screening caller with retry capability
  const executeScreening = useCallback(async () => {
    setErrorInfo(null);
    setIsRetrying(true);
    setCurrentStepIndex(0);
    setProgress(15);
    setStatusMessage('Executing automated optical analysis and biometric verification engines...');

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
          message: data.message || 'The uploaded credential image is damaged, unreadable, or could not be decoded.'
        });
        setStatusMessage('Screening halted: Image decode failure.');
        return;
      }

      if (data.analysis) {
        setApiResult(data.analysis);
      }
    } catch (err: any) {
      console.error('Analysis execution error:', err);
      setErrorInfo({
        error: 'NETWORK_ERROR',
        message: err.message || 'Unable to communicate with verification services. Please check connection.'
      });
      setStatusMessage('Screening halted: Service communication error.');
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
      setStatusMessage('Verification Complete! Loading Forensic Report...');
      const timeout = setTimeout(() => {
        onAnalysisComplete(apiResult);
        setCurrentPage('officer_analysis');
      }, 700);
      return () => clearTimeout(timeout);
    }
  }, [currentStepIndex, apiResult, errorInfo, onAnalysisComplete, setCurrentPage]);

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8 pb-16">
      {/* Top Animation & Ticker */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600"></span>
          </span>
        </div>

        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
            <span>AUTOMATED VERIFICATION IN PROGRESS</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Screening Travel Credentials</h2>
          <p className="text-xs text-slate-500 mt-1">{statusMessage}</p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="max-w-md mx-auto space-y-1.5">
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-700 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500">
            <span>VERIFICATION PIPELINE</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Corrupted Image Error Fallback Card */}
      {errorInfo && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 md:p-8 shadow-sm space-y-6 text-center animate-fade-in">
          <div className="w-14 h-14 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md bg-red-100 border border-red-200 text-red-800 text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5" />
              <span>INSPECTION HALTED • {errorInfo.error}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Unreadable or Corrupted Image
            </h3>
            <p className="text-xs text-red-900 leading-relaxed font-sans">
              {errorInfo.message}
            </p>
            <p className="text-[11px] text-slate-600 pt-1">
              The optical parser could not construct valid pixel arrays from the input payload. Please retry or upload a clean JPEG/PNG document image.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => executeScreening()}
              disabled={isRetrying}
              className="px-5 py-2.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-semibold text-xs flex items-center space-x-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Retrying...' : 'Retry Verification'}</span>
            </button>

            <button
              onClick={() => setCurrentPage('new_screening')}
              className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs flex items-center space-x-2 cursor-pointer transition-all shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Re-upload Document</span>
            </button>
          </div>
        </div>
      )}

      {/* Pipeline Steps Cards */}
      <div className="rounded-xl bg-white border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-sm">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < currentStepIndex || progress === 100;
          const isCurrent = idx === currentStepIndex && progress < 100;

          return (
            <div
              key={step.name}
              className={`p-4 flex items-center justify-between transition-colors ${
                isCurrent
                  ? 'bg-blue-50/70 text-slate-900'
                  : isDone
                  ? 'bg-white text-slate-800'
                  : 'bg-slate-50/50 text-slate-400'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isCurrent
                    ? 'bg-blue-700 text-white shadow-sm'
                    : isDone
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold flex items-center space-x-2">
                    <span className={isDone ? 'text-slate-900' : isCurrent ? 'text-blue-900 font-bold' : 'text-slate-500'}>
                      {step.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] text-blue-700 font-mono font-bold">
                        [IN PROGRESS]
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{step.detail}</div>
                </div>
              </div>

              <div>
                {isDone ? (
                  <span className="flex items-center space-x-1 text-emerald-700 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="hidden sm:inline">COMPLETED</span>
                  </span>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-700 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono text-slate-400">PENDING</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

