import React, { useState } from 'react';
import {
  Settings,
  Cpu,
  ShieldCheck,
  Database,
  Lock,
  RefreshCw,
  AlertTriangle,
  FileCode,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [officerId, setOfficerId] = useState('OFFICER-742');
  const [counterId, setCounterId] = useState('COUNTER 04');
  const [tamperingWeight, setTamperingWeight] = useState(25);
  const [databaseWeight, setDatabaseWeight] = useState(25);
  const [faceWeight, setFaceWeight] = useState(25);
  const [docWeight, setDocWeight] = useState(15);
  const [qualityWeight, setQualityWeight] = useState(10);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDb = async () => {
    if (confirm('Restore Authorized Database back to default baseline identities?')) {
      await fetch('/api/database/reset', { method: 'POST' });
      alert('Authorized database restored to baseline.');
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Settings & System Architecture</h1>
        <p className="text-xs text-slate-500">
          Inspection terminal preferences, deep learning engine parameters, and border screening specifications.
        </p>
      </div>

      {/* Prototype Status Card */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shadow-xs">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Inspection & Analysis Engine Architecture</h3>
              <p className="text-xs text-slate-500">Integrated computer vision, OCR, and biometric frameworks</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
            v1.0 • OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-[10px] font-sans font-semibold">OCR ENGINE</div>
            <div className="text-slate-900 font-bold mt-0.5">PaddleOCR (PP-OCRv4 Deep Learning)</div>
            <div className="text-slate-500 text-[10px] mt-1 font-sans">Text detection (DBNet) & Text recognition (CRNN/SVTR)</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-[10px] font-sans font-semibold">BIOMETRIC ENGINE</div>
            <div className="text-slate-900 font-bold mt-0.5">InsightFace (ArcFace 512-D Embeddings)</div>
            <div className="text-slate-500 text-[10px] mt-1 font-sans">RetinaFace 5-point alignment & Cosine Similarity</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-[10px] font-sans font-semibold">TAMPERING FORENSICS</div>
            <div className="text-slate-900 font-bold mt-0.5">Error Level Analysis (ELA) + Disparity</div>
            <div className="text-slate-500 text-[10px] mt-1 font-sans">Compression grid delta, substrate noise & edge gradients</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-slate-500 text-[10px] font-sans font-semibold">AUDIT INTEGRITY LEDGER</div>
            <div className="text-blue-900 font-bold mt-0.5">SHA-256 Cryptographic Hash Chaining</div>
            <div className="text-slate-500 text-[10px] mt-1 font-sans">Blockchain-style tamper-evident sequential block linkage</div>
          </div>
        </div>
      </div>

      {/* Multi-Modal Risk Engine Weightings */}
      <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
            <Sliders className="w-4 h-4 text-blue-700" />
            <span>Multi-Modal Risk Engine Weightings</span>
          </div>
          <span className="text-xs text-slate-500 font-mono font-bold">Total: {tamperingWeight + databaseWeight + faceWeight + docWeight + qualityWeight}%</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Tampering & ELA Detection Weight:</span>
              <span className="font-mono text-blue-700 font-bold">{tamperingWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={tamperingWeight}
              onChange={(e) => setTamperingWeight(Number(e.target.value))}
              className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Authorized Database Verification Weight:</span>
              <span className="font-mono text-blue-700 font-bold">{databaseWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={databaseWeight}
              onChange={(e) => setDatabaseWeight(Number(e.target.value))}
              className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>InsightFace Biometric Match Weight:</span>
              <span className="font-mono text-blue-700 font-bold">{faceWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={faceWeight}
              onChange={(e) => setFaceWeight(Number(e.target.value))}
              className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Document Schema & MRZ Validation Weight:</span>
              <span className="font-mono text-blue-700 font-bold">{docWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={docWeight}
              onChange={(e) => setDocWeight(Number(e.target.value))}
              className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>OCR & Image Quality (IQA) Weight:</span>
              <span className="font-mono text-blue-700 font-bold">{qualityWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={qualityWeight}
              onChange={(e) => setQualityWeight(Number(e.target.value))}
              className="w-full accent-blue-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Officer Station Profile */}
      <form onSubmit={handleSave} className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Inspection Terminal Officer Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-700 uppercase font-bold text-[10px] block mb-1">Officer Badge ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
            />
          </div>
          <div>
            <label className="text-slate-700 uppercase font-bold text-[10px] block mb-1">Counter / Gate Assignment</label>
            <input
              type="text"
              value={counterId}
              onChange={(e) => setCounterId(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDb}
            className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            Restore Baseline Database
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            {isSaved ? 'Settings Saved!' : 'Save Terminal Settings'}
          </button>
        </div>
      </form>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
        <div className="font-bold text-slate-800 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-blue-700" />
          <span>Statutory Compliance & Security Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Operational deployment of automated border control, biometric facial recognition, and cryptographic identity verification adheres to ICAO Doc 9303 standards, ISO/IEC 19794-5 biometric formatting, and civil privacy regulations.
        </p>
      </div>
    </div>
  );
};
