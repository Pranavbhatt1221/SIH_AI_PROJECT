import React from 'react';
import {
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  ScanFace,
  Lock,
  ArrowRight,
  Cpu,
  AlertTriangle,
  Play,
  Layers,
  Database,
  Eye,
  Check
} from 'lucide-react';
import { PageView } from '../types';

interface LandingPageProps {
  setCurrentPage: (page: PageView) => void;
  onSelectDemoCase?: (caseId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage, onSelectDemoCase }) => {
  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-navy-850 to-navy-950 border border-navy-750 p-8 md:p-12 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Prototype • SIH Demonstration</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI-Based Fake Identity & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Document Screening System
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 font-normal leading-relaxed">
            AI-powered document verification and identity screening for faster, smarter and more reliable border security.
            Automated screening of passports, visas, national IDs, and permits with deep tampering forensics and biometric cross-verification.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage('new_screening')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>START SCREENING</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 font-bold text-sm tracking-wide transition-all flex items-center space-x-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Officer Dashboard</span>
            </button>
          </div>

          {/* Prototype / Fictional Disclaimer */}
          <div className="pt-4 flex items-start space-x-3 text-xs text-slate-400 bg-navy-900/80 p-4 rounded-xl border border-navy-750">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-200">Prototype Demonstration System: </span>
              This system is an SIH prototype designed for automated border checkpoint evaluation.
              All records in the authorized verification database are completely fictional and simulated.
              Does not access live civil or sovereign biometric registers.
            </div>
          </div>
        </div>
      </section>

      {/* 4 Major Capabilities */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold font-mono tracking-wider text-cyan-400 uppercase">Core Architecture</div>
          <h2 className="text-2xl font-bold text-white mt-1">Four Core AI Screening Pillars</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">OCR EXTRACTION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Powered by <span className="text-cyan-300 font-semibold">PaddleOCR (PP-OCRv4)</span>. Automatically extracts biographical text, serials, and ICAO Doc 9303 MRZ zones with orientation rectification.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4 hover:border-emerald-500/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">DOCUMENT VALIDATION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Validates document structure, date continuity, validity windows, 7-3-1 modulus-10 MRZ mathematical checksums, and cross-checks with authorized registers.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4 hover:border-amber-500/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">TAMPERING DETECTION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Detects suspicious photo replacement, text alteration, cloned visa stamps, and splicing using <span className="text-amber-300 font-semibold">Error Level Analysis (ELA)</span> and edge disparity filters.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4 hover:border-purple-500/40 transition-all group">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <ScanFace className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white">FACE VERIFICATION</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Powered by <span className="text-purple-300 font-semibold">InsightFace (ArcFace 512-D)</span>. Deep landmark detection, anti-spoofing liveness, and 3-way cosine similarity matching against live traveler capture.
            </p>
          </div>
        </div>
      </section>

      {/* 5 Pre-Configured Hackathon Demo Scenarios */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold font-mono tracking-wider text-cyan-400 uppercase">SIH Evaluation Showcase</div>
            <h2 className="text-2xl font-bold text-white mt-1">5 Pre-Calibrated Demo Scenarios</h2>
          </div>
          <button
            onClick={() => setCurrentPage('new_screening')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center space-x-1"
          >
            <span>Launch in New Screening</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Demo Case 1 */}
          <div
            onClick={() => {
              if (onSelectDemoCase) onSelectDemoCase('CASE_1');
              setCurrentPage('new_screening');
            }}
            className="rounded-xl bg-navy-900 border border-emerald-500/30 p-4 space-y-3 cursor-pointer hover:border-emerald-400 hover:bg-navy-850 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded">CASE 1</span>
              <span className="text-[10px] font-bold text-emerald-400">PASS</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Genuine Document</h4>
            <p className="text-[11px] text-slate-400">Aarav Mehta • P1234567</p>
            <div className="text-[10px] text-slate-300">Biometrics match (94%), clean ELA, valid database record.</div>
          </div>

          {/* Demo Case 2 */}
          <div
            onClick={() => {
              if (onSelectDemoCase) onSelectDemoCase('CASE_2');
              setCurrentPage('new_screening');
            }}
            className="rounded-xl bg-navy-900 border border-amber-500/30 p-4 space-y-3 cursor-pointer hover:border-amber-400 hover:bg-navy-850 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">CASE 2</span>
              <span className="text-[10px] font-bold text-amber-400">REVIEW</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Altered Date of Birth</h4>
            <p className="text-[11px] text-slate-400">Priya Sharma • P2345678</p>
            <div className="text-[10px] text-slate-300">Document DOB (2001) conflicts with database on file (2002).</div>
          </div>

          {/* Demo Case 3 */}
          <div
            onClick={() => {
              if (onSelectDemoCase) onSelectDemoCase('CASE_3');
              setCurrentPage('new_screening');
            }}
            className="rounded-xl bg-navy-900 border border-red-500/30 p-4 space-y-3 cursor-pointer hover:border-red-400 hover:bg-navy-850 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded">CASE 3</span>
              <span className="text-[10px] font-bold text-red-400">FAIL</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Photo Splicing / Impersonator</h4>
            <p className="text-[11px] text-slate-400">Rahul Verma • P3456789</p>
            <div className="text-[10px] text-slate-300">High ELA tampering (90%) and face mismatch (34%). Impersonation.</div>
          </div>

          {/* Demo Case 4 */}
          <div
            onClick={() => {
              if (onSelectDemoCase) onSelectDemoCase('CASE_4');
              setCurrentPage('new_screening');
            }}
            className="rounded-xl bg-navy-900 border border-amber-500/30 p-4 space-y-3 cursor-pointer hover:border-amber-400 hover:bg-navy-850 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded">CASE 4</span>
              <span className="text-[10px] font-bold text-amber-400">REVIEW</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Expired Document</h4>
            <p className="text-[11px] text-slate-400">Carlos Mendez • P4567890</p>
            <div className="text-[10px] text-slate-300">Authentic passport and face match, but elapsed expiry date.</div>
          </div>

          {/* Demo Case 5 */}
          <div
            onClick={() => {
              if (onSelectDemoCase) onSelectDemoCase('CASE_5');
              setCurrentPage('new_screening');
            }}
            className="rounded-xl bg-navy-900 border border-red-500/30 p-4 space-y-3 cursor-pointer hover:border-red-400 hover:bg-navy-850 transition-all group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-red-400 bg-red-500/15 px-2 py-0.5 rounded">CASE 5</span>
              <span className="text-[10px] font-bold text-red-400">FAIL</span>
            </div>
            <h4 className="font-bold text-sm text-white group-hover:text-cyan-300">Blacklisted / Interpol</h4>
            <p className="text-[11px] text-slate-400">Viktor Petrov • P9876543</p>
            <div className="text-[10px] text-slate-300">Active Interpol Red Notice hit in database. Mandatory border detention.</div>
          </div>
        </div>
      </section>

      {/* Tamper-Evident Ledger Preview */}
      <section className="rounded-2xl bg-navy-900 border border-navy-750 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-purple-400 text-xs font-mono font-bold">
            <Lock className="w-4 h-4" />
            <span>BLOCKCHAIN-STYLE TAMPER-EVIDENT AUDIT TRAIL</span>
          </div>
          <h3 className="text-xl font-bold text-white">Every Officer Decision Is Cryptographically Chained</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All screenings generate an immutable SHA-256 block cryptographically linked to the previous inspection record hash.
            Our real-time ledger validator verifies that no historic border control logs have been deleted or altered.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('audit')}
          className="px-5 py-3 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-xs tracking-wide transition-all shrink-0 cursor-pointer"
        >
          Inspect Audit Ledger
        </button>
      </section>
    </div>
  );
};
