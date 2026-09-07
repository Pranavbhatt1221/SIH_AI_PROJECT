import React from 'react';
import {
  ShieldCheck,
  FileSearch,
  CheckCircle2,
  ScanFace,
  Lock,
  ArrowRight,
  Shield,
  Layers,
  Database,
  Eye,
  Check,
  Award,
  Globe
} from 'lucide-react';
import { PageView } from '../types';

interface LandingPageProps {
  setCurrentPage: (page: PageView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setCurrentPage }) => {
  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-white border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>Border Control Inspection & Verification Station</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Automated Document Verification & <br />
            <span className="text-blue-700">
              Biometric Screening System
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-600 font-normal leading-relaxed">
            High-assurance travel credential authentication and identity verification designed for official border control checkpoints, immigration authorities, and identity management terminals.
          </p>

          {/* Key Compliance Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600 font-medium">
            <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>ICAO Doc 9303 MRZ Checksum Standard</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Deep Learning 1:1 Facial Match</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Error Level Forensics</span>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={() => setCurrentPage('new_screening')}
              className="px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm tracking-wide shadow-sm hover:shadow transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>START SCREENING</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className="px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm tracking-wide transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
            >
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Inspection Dashboard</span>
            </button>
          </div>
        </div>
      </section>

      {/* 4 Major Pillars */}
      <section className="space-y-6">
        <div>
          <div className="text-xs font-bold tracking-wider text-blue-700 uppercase">Verification Framework</div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">Four Core Inspection Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm hover:border-blue-300 hover:shadow transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <FileSearch className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">OCR & Field Extraction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Extracts biographical fields, document serial numbers, issue/expiry dates, and ICAO Doc 9303 MRZ zones with automated orientation correction.
            </p>
          </div>

          {/* Card 2 */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm hover:border-emerald-300 hover:shadow transition-all">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Document Validation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Performs mathematical 7-3-1 modulus-10 MRZ checksum validation, date continuity checks, and real-time cross-referencing against the civil registry.
            </p>
          </div>

          {/* Card 3 */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm hover:border-amber-300 hover:shadow transition-all">
            <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Forensic Tampering Check</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Examines compression artifacts using Error Level Analysis (ELA) and substrate noise gradients to detect photo replacement, text modification, or stamp cloning.
            </p>
          </div>

          {/* Card 4 */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-3 shadow-sm hover:border-indigo-300 hover:shadow transition-all">
            <div className="w-12 h-12 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
              <ScanFace className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Biometric Verification</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Performs 1:1 facial biometric matching between the document photo and live traveler capture, utilizing landmark alignment and cosine similarity scoring.
            </p>
          </div>
        </div>
      </section>

      {/* Tamper-Evident Ledger Preview */}
      <section className="rounded-xl bg-slate-900 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2 text-blue-300 text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span className="uppercase tracking-wide">Tamper-Evident Inspection Audit Trail</span>
          </div>
          <h3 className="text-xl font-bold text-white">Every Officer Decision Is Cryptographically Chained</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All screening records generate an immutable SHA-256 hash block linked to the previous inspection record.
            This ensures complete auditability and prevents unauthorized alteration or deletion of border records.
          </p>
        </div>
        <button
          onClick={() => setCurrentPage('audit')}
          className="px-5 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs tracking-wide transition-all shrink-0 cursor-pointer shadow-sm"
        >
          Inspect Audit Ledger
        </button>
      </section>
    </div>
  );
};

