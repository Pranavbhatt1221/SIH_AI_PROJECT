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
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-white mt-1">Settings & System Architecture</h1>
        <p className="text-xs text-slate-400">
          Inspection terminal preferences, deep learning engine parameters, and border screening specifications.
        </p>
      </div>

      {/* Prototype Status Card */}
      <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">AI Deep Learning Stack Information</h3>
              <p className="text-xs text-slate-400">Integrated computer vision and biometric frameworks</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            v1.0 • ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-2">
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="text-slate-400 text-[10px]">OCR ENGINE</div>
            <div className="text-white font-bold mt-0.5">PaddleOCR (PP-OCRv4 Deep Learning)</div>
            <div className="text-slate-400 text-[10px] mt-1">Text detection (DBNet) & Text recognition (CRNN/SVTR)</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="text-slate-400 text-[10px]">BIOMETRIC ENGINE</div>
            <div className="text-white font-bold mt-0.5">InsightFace (ArcFace 512-D Embeddings)</div>
            <div className="text-slate-400 text-[10px] mt-1">RetinaFace 5-point alignment & Cosine Similarity</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="text-slate-400 text-[10px]">TAMPERING FORENSICS</div>
            <div className="text-white font-bold mt-0.5">Error Level Analysis (ELA) + Disparity</div>
            <div className="text-slate-400 text-[10px] mt-1">Compression grid delta, substrate noise & edge gradients</div>
          </div>
          <div className="p-3 rounded-lg bg-navy-950 border border-navy-800">
            <div className="text-slate-400 text-[10px]">AUDIT INTEGRITY LEDGER</div>
            <div className="text-purple-400 font-bold mt-0.5">SHA-256 Cryptographic Hash Chaining</div>
            <div className="text-slate-400 text-[10px] mt-1">Blockchain-style tamper-evident sequential block linkage</div>
          </div>
        </div>
      </div>

      {/* Multi-Modal Risk Engine Weightings */}
      <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white font-bold text-sm">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Multi-Modal Risk Engine Weightings</span>
          </div>
          <span className="text-xs text-slate-400 font-mono font-bold">Total: {tamperingWeight + databaseWeight + faceWeight + docWeight + qualityWeight}%</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>AI Tampering & ELA Detection Weight:</span>
              <span className="font-mono text-cyan-400 font-bold">{tamperingWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={tamperingWeight}
              onChange={(e) => setTamperingWeight(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Authorized Database Verification Weight:</span>
              <span className="font-mono text-cyan-400 font-bold">{databaseWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={databaseWeight}
              onChange={(e) => setDatabaseWeight(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>InsightFace Biometric Match Weight:</span>
              <span className="font-mono text-cyan-400 font-bold">{faceWeight}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={50}
              value={faceWeight}
              onChange={(e) => setFaceWeight(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>Document Schema & MRZ Validation Weight:</span>
              <span className="font-mono text-cyan-400 font-bold">{docWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={30}
              value={docWeight}
              onChange={(e) => setDocWeight(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-slate-300">
              <span>OCR & Image Quality (IQA) Weight:</span>
              <span className="font-mono text-cyan-400 font-bold">{qualityWeight}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={25}
              value={qualityWeight}
              onChange={(e) => setQualityWeight(Number(e.target.value))}
              className="w-full accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Officer Station Profile */}
      <form onSubmit={handleSave} className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
        <h3 className="text-sm font-bold text-white">Inspection Terminal Officer Identity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Officer Badge ID</label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full bg-navy-950 border border-navy-750 rounded p-2.5 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-slate-400 uppercase font-bold text-[10px] block mb-1">Counter / Gate Assignment</label>
            <input
              type="text"
              value={counterId}
              onChange={(e) => setCounterId(e.target.value)}
              className="w-full bg-navy-950 border border-navy-750 rounded p-2.5 text-white font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDb}
            className="px-3.5 py-2 rounded-lg bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
          >
            Restore Baseline Database
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-colors cursor-pointer"
          >
            {isSaved ? 'Settings Saved!' : 'Save Terminal Settings'}
          </button>
        </div>
      </form>

      {/* Compliance Notice */}
      <div className="p-4 rounded-xl bg-navy-900 border border-navy-750 text-xs space-y-2 text-slate-400">
        <div className="font-bold text-slate-200 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span>Statutory Compliance & Security Notice</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Operational deployment of automated border control, biometric facial recognition, and cryptographic identity verification adheres to ICAO Doc 9303 standards, ISO/IEC 19794-5 biometric formatting, and strict data privacy mandates.
        </p>
      </div>
    </div>
  );
};
