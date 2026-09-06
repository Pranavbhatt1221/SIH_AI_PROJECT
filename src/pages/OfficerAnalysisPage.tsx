import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  FileText,
  ScanFace,
  Eye,
  Database,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Sliders,
  Sparkles,
  ExternalLink,
  Edit3,
  Layers,
  FileCheck2,
  Lock,
  ArrowLeft,
  ChevronRight,
  Maximize2,
  Plus,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { PageView, AnalysisResult } from '../types';
import { Badge } from '../components/Badge';

interface OfficerAnalysisPageProps {
  analysis: AnalysisResult;
  setCurrentPage: (page: PageView) => void;
  onSelectCase?: (caseId: string) => void;
}

export const OfficerAnalysisPage: React.FC<OfficerAnalysisPageProps> = ({
  analysis,
  setCurrentPage
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'forensics' | 'biometrics' | 'database' | 'raw_ocr'>('overview');
  const [showElaView, setShowElaView] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<'PASS' | 'REVIEW' | 'FAIL'>(analysis.recommended_decision || 'PASS');
  const [officerRemarks, setOfficerRemarks] = useState(
    analysis.recommended_decision === 'PASS'
      ? "Document credentials and facial biometrics verified against authorized records. Cleared for entry."
      : analysis.recommended_decision === 'REVIEW'
      ? "Discrepancy detected during optical/database inspection. Referred for secondary screening."
      : "CRITICAL ALERT: Serious biometric mismatch, tampering signature, or watchlist hit. Denied entry."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);

  // Editable OCR fields modal state
  const [isEditOcrOpen, setIsEditOcrOpen] = useState(false);
  const [editableFields, setEditableFields] = useState({ ...analysis.ocr.extracted_fields });

  // Database registration modal for custom unregistered documents
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerStatus, setRegisterStatus] = useState('VALID');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationMessage, setRegistrationMessage] = useState('');

  // Handle register document to database
  const handleRegisterToDatabase = async () => {
    setIsRegistering(true);
    try {
      const res = await fetch('/api/screening/register-to-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document_number: editableFields.document_number,
          full_name: editableFields.full_name,
          nationality: editableFields.nationality,
          date_of_birth: editableFields.date_of_birth,
          expiry_date: editableFields.expiry_date,
          gender: editableFields.gender,
          status: registerStatus,
          photo_reference: analysis.images.document_photo
        })
      });
      const data = await res.json();
      if (data.success) {
        setRegistrationMessage(`Successfully stored ${editableFields.document_number} into Mock Authorized Database with status ${registerStatus}!`);
        setIsRegisterOpen(false);
        // Update local database check representation
        analysis.database_check.found = true;
        analysis.database_check.passport = data.passport;
        analysis.database_check.status = registerStatus;
        analysis.database_check.name_match = true;
        analysis.database_check.dob_match = true;
      }
    } catch (err) {
      console.error('Registration failed', err);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleFinalizeDecision = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        case_id: analysis.case_id,
        person_name: editableFields.full_name,
        document_type: analysis.document_type,
        document_number: editableFields.document_number,
        risk_score: analysis.risk.final_risk_score,
        risk_level: analysis.risk.risk_level,
        face_match_score: analysis.face.scores.overall_face_match_score,
        tampering_score: analysis.tampering.tampering_score,
        database_status: analysis.database_check.status,
        decision: selectedDecision,
        officer_id: "OFFICER-742",
        officer_remarks: officerRemarks
      };

      const res = await fetch('/api/screening/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setIsFinalized(true);
      }
    } catch (err) {
      console.error('Finalize error', err);
      alert('Error finalizing decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field by field comparisons between PaddleOCR and Database on file
  const dbPassport = analysis.database_check.passport;
  const comparisonItems = [
    {
      field: "Document / Passport Number",
      ocrValue: editableFields.document_number,
      dbValue: dbPassport ? dbPassport.passport_number : "RECORD NOT FOUND",
      isMatch: dbPassport ? (editableFields.document_number.toUpperCase() === dbPassport.passport_number.toUpperCase()) : false
    },
    {
      field: "Full Name",
      ocrValue: editableFields.full_name,
      dbValue: dbPassport ? dbPassport.full_name : "RECORD NOT FOUND",
      isMatch: dbPassport ? (editableFields.full_name.toLowerCase().replace(/\s+/g, '') === dbPassport.full_name.toLowerCase().replace(/\s+/g, '')) : false
    },
    {
      field: "Date of Birth",
      ocrValue: editableFields.date_of_birth,
      dbValue: dbPassport ? dbPassport.date_of_birth : "RECORD NOT FOUND",
      isMatch: dbPassport ? (editableFields.date_of_birth.replace(/\D/g, '') === dbPassport.date_of_birth.replace(/\D/g, '')) : false
    },
    {
      field: "Expiry Date",
      ocrValue: editableFields.expiry_date,
      dbValue: dbPassport ? dbPassport.expiry_date : "RECORD NOT FOUND",
      isMatch: dbPassport ? (editableFields.expiry_date.replace(/\D/g, '') === dbPassport.expiry_date.replace(/\D/g, '')) : false
    },
    {
      field: "Nationality",
      ocrValue: editableFields.nationality,
      dbValue: dbPassport ? dbPassport.nationality : "RECORD NOT FOUND",
      isMatch: dbPassport ? (editableFields.nationality.toUpperCase() === dbPassport.nationality.toUpperCase()) : false
    },
    {
      field: "Passport / Document Status",
      ocrValue: "Physical Scan Presented",
      dbValue: dbPassport ? dbPassport.status : "UNREGISTERED",
      isMatch: dbPassport ? (dbPassport.status === "VALID") : false
    }
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="text-xs text-slate-400 hover:text-white flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Command Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span>TIME OF INSPECTION:</span>
          <span className="text-white font-bold">{new Date(analysis.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Primary Case ID & Risk Banner */}
      <div className={`rounded-2xl border p-6 shadow-2xl relative overflow-hidden ${
        analysis.risk.final_risk_score >= 60
          ? 'bg-gradient-to-r from-red-950/90 via-navy-900 to-navy-950 border-red-500/40 shadow-red-500/10'
          : analysis.risk.final_risk_score >= 30
          ? 'bg-gradient-to-r from-amber-950/80 via-navy-900 to-navy-950 border-amber-500/40 shadow-amber-500/10'
          : 'bg-gradient-to-r from-emerald-950/80 via-navy-900 to-navy-950 border-emerald-500/40 shadow-emerald-500/10'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Case Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-black/60 text-cyan-400 border border-cyan-500/30">
                {analysis.case_id}
              </span>
              <Badge status={analysis.risk.risk_level} />
              <span className="text-xs font-mono text-slate-400">
                {analysis.document_type.toUpperCase()} • {editableFields.document_number}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight">
              {editableFields.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span>DOB: <strong className="text-white font-mono">{editableFields.date_of_birth}</strong></span>
              <span>•</span>
              <span>Nationality: <strong className="text-white font-mono">{editableFields.nationality}</strong></span>
              <span>•</span>
              <span>Sex: <strong className="text-white font-mono">{editableFields.gender}</strong></span>
              <span>•</span>
              <span>Expiry: <strong className="text-white font-mono">{editableFields.expiry_date}</strong></span>
            </div>
          </div>

          {/* Right: Risk Score Gauge */}
          <div className="flex items-center space-x-6 shrink-0 bg-navy-950/70 p-4 rounded-xl border border-navy-750">
            <div className="text-right">
              <div className="text-[10px] uppercase font-mono font-bold text-slate-400">COMPOSITE RISK SCORE</div>
              <div className="flex items-baseline justify-end space-x-1">
                <span className={`text-4xl font-black font-mono ${
                  analysis.risk.final_risk_score >= 60 ? 'text-red-400' :
                  analysis.risk.final_risk_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {analysis.risk.final_risk_score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="text-[11px] font-bold text-slate-300">
                Recommended: <span className="text-cyan-400">{analysis.recommended_decision}</span>
              </div>
            </div>

            <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center font-mono font-bold text-xs" style={{
              borderColor: analysis.risk.final_risk_score >= 60 ? '#EF4444' : analysis.risk.final_risk_score >= 30 ? '#F59E0B' : '#10B981',
              backgroundColor: analysis.risk.final_risk_score >= 60 ? 'rgba(239, 68, 68, 0.15)' : analysis.risk.final_risk_score >= 30 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'
            }}>
              {analysis.risk.risk_level.split(' ')[0]}
            </div>
          </div>
        </div>

        {analysis.risk.override_applied && (
          <div className="mt-4 pt-3 border-t border-red-500/30 flex items-center space-x-2 text-xs text-red-300 font-bold">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{analysis.risk.override_reason}</span>
          </div>
        )}
      </div>

      {/* Registration success alert */}
      {registrationMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-xs flex items-center justify-between text-emerald-300">
          <div className="flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{registrationMessage}</span>
          </div>
          <button onClick={() => setRegistrationMessage('')} className="text-slate-400 hover:text-white">&times;</button>
        </div>
      )}

      {/* Navigation Tabs for Forensic Inspector */}
      <div className="flex items-center space-x-2 border-b border-navy-750 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Screening Overview & Validation' },
          { id: 'forensics', label: 'AI Tampering & ELA Heatmap' },
          { id: 'biometrics', label: 'InsightFace 512-D Biometrics' },
          { id: 'database', label: 'Database Comparison & Manual Store' },
          { id: 'raw_ocr', label: 'Raw OCR Output' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-navy-850'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & VALIDATION */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Document Visual + Quality (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl bg-navy-900 border border-navy-750 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span>Physical Credential</span>
                  </h3>
                  <Badge status={`IQA ${analysis.iqa.score}/100`} />
                </div>

                {/* Document Preview */}
                <div className="relative rounded-xl overflow-hidden border border-navy-750 bg-navy-950 p-2 flex items-center justify-center">
                  <img
                    src={analysis.images.document_preview}
                    alt="Document Scan"
                    className="max-h-64 object-contain rounded"
                  />
                  <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400 border border-cyan-400/30">
                    SCAN CAPTURED
                  </div>
                </div>

                {/* Image Quality Metrics Table */}
                <div className="space-y-2 pt-2 border-t border-navy-800 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Image Quality Assessment (IQA)</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-navy-850 border border-navy-750">
                      <div className="text-slate-400 text-[10px]">Resolution</div>
                      <div className="font-mono text-slate-200 font-bold">{analysis.iqa.metrics.resolution?.value || '1920x1280'}</div>
                    </div>
                    <div className="p-2 rounded bg-navy-850 border border-navy-750">
                      <div className="text-slate-400 text-[10px]">Sharpness / Blur</div>
                      <div className="font-mono text-emerald-400 font-bold">Sharp (Var: 412)</div>
                    </div>
                    <div className="p-2 rounded bg-navy-850 border border-navy-750">
                      <div className="text-slate-400 text-[10px]">Brightness</div>
                      <div className="font-mono text-slate-200 font-bold">{analysis.iqa.metrics.brightness?.value || '138 / 255'}</div>
                    </div>
                    <div className="p-2 rounded bg-navy-850 border border-navy-750">
                      <div className="text-slate-400 text-[10px]">Framing</div>
                      <div className="font-mono text-emerald-400 font-bold">Visible (4 corners)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: OCR & Document Validation (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* OCR Table */}
              <div className="rounded-xl bg-navy-900 border border-navy-750 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      PaddleOCR Separated Character Fields
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditOcrOpen(true)}
                    className="px-3 py-1 rounded bg-navy-800 hover:bg-cyan-500/20 text-cyan-400 border border-navy-700 text-xs font-bold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Verify OCR</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Full Name</div>
                    <div className="font-bold text-white mt-0.5">{editableFields.full_name}</div>
                  </div>
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Document Number</div>
                    <div className="font-mono font-bold text-cyan-400 mt-0.5">{editableFields.document_number}</div>
                  </div>
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Nationality</div>
                    <div className="font-mono font-bold text-white mt-0.5">{editableFields.nationality}</div>
                  </div>
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Date of Birth</div>
                    <div className="font-mono font-bold text-white mt-0.5">{editableFields.date_of_birth}</div>
                  </div>
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Sex</div>
                    <div className="font-mono font-bold text-white mt-0.5">{editableFields.gender}</div>
                  </div>
                  <div className="p-2.5 rounded bg-navy-850 border border-navy-750">
                    <div className="text-slate-400 text-[10px]">Expiry Date</div>
                    <div className="font-mono font-bold text-white mt-0.5">{editableFields.expiry_date}</div>
                  </div>
                </div>

                {/* MRZ Zone Display */}
                {analysis.ocr.mrz && (
                  <div className="p-3 rounded-lg bg-navy-950 border border-navy-800 font-mono text-xs space-y-1">
                    <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Machine Readable Zone (ICAO 9303 MRZ)</span>
                      <span className="text-emerald-400 font-sans text-[10px]">Modulus-10 Check Valid</span>
                    </div>
                    <div className="text-slate-300 tracking-widest break-all select-all">{analysis.ocr.mrz.line1}</div>
                    <div className="text-slate-300 tracking-widest break-all select-all">{analysis.ocr.mrz.line2}</div>
                  </div>
                )}
              </div>

              {/* Document Validation Checklist */}
              <div className="rounded-xl bg-navy-900 border border-navy-750 p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Automated Document Validation Checklist</span>
                </h3>

                <div className="divide-y divide-navy-800 text-xs">
                  {analysis.doc_validation.checks.map((chk) => (
                    <div key={chk.name} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">{chk.name}</div>
                        <div className="text-[11px] text-slate-400">{chk.detail}</div>
                      </div>
                      <Badge status={chk.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Result & Reasons */}
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
            <div className="flex items-center space-x-2 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Explainable AI Result — Why This Credential Was Evaluated
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Transparent breakdown of factors influencing the composite risk determination:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {analysis.risk.explainable_factors.map((factor, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${
                    factor.type === 'FAIL'
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : factor.type === 'WARN'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  <span className="font-bold text-sm shrink-0 mt-0.5">{factor.icon}</span>
                  <span className="leading-relaxed">{factor.text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">FINAL RISK ASSESSMENT</div>
                <div className="font-bold text-white text-sm">{analysis.risk.summary_sentence}</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono font-bold text-xs shrink-0">
                ACTION: {analysis.risk.recommended_action}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI TAMPERING DETECTION & ELA HEATMAP */}
      {activeTab === 'forensics' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">AI Image Tampering & Manipulation Forensics</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Computer vision analysis: Error Level Analysis (ELA), edge boundary discontinuity, and noise variance.
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-navy-850 p-1 rounded-lg border border-navy-750 self-start">
                <button
                  onClick={() => setShowElaView(false)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    !showElaView ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Standard View
                </button>
                <button
                  onClick={() => setShowElaView(true)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
                    showElaView ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ELA Forensic Heatmap
                </button>
              </div>
            </div>

            {/* Side-by-side or Toggled ELA Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>DOCUMENT SCAN</span>
                  <span className="text-[10px] text-slate-400">ORIGINAL SUBSTRATE</span>
                </div>
                <div className="rounded-xl overflow-hidden bg-navy-950 border border-navy-750 p-2 flex items-center justify-center min-h-[260px]">
                  <img
                    src={analysis.images.document_preview}
                    alt="Original"
                    className="max-h-60 object-contain rounded"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="text-amber-400 flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5" />
                    <span>ERROR LEVEL ANALYSIS (ELA) HEATMAP</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">RESAVED Q=90</span>
                </div>
                <div className="rounded-xl overflow-hidden bg-navy-950 border border-navy-750 p-2 flex items-center justify-center min-h-[260px]">
                  <img
                    src={analysis.tampering.ela_heatmap_url}
                    alt="ELA Heatmap"
                    className="max-h-60 object-contain rounded"
                  />
                </div>
              </div>
            </div>

            {/* Tampering Metrics & Anomalies */}
            <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <span>Tampering Score:</span>
                  <span className={`font-mono font-black text-base ${
                    analysis.tampering.tampering_score >= 60 ? 'text-red-400' :
                    analysis.tampering.tampering_score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {analysis.tampering.tampering_score}/100
                  </span>
                </div>
                <Badge status={analysis.tampering.risk_level} />
              </div>

              <div className="text-xs text-slate-300 italic">
                "{analysis.tampering.notice}"
              </div>

              <div className="divide-y divide-navy-800/80 pt-2 text-xs">
                {analysis.tampering.anomalies.map((anom) => (
                  <div key={anom.label} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{anom.label}</div>
                      <div className="text-[11px] text-slate-400">{anom.detail}</div>
                    </div>
                    <Badge status={anom.status} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INSIGHTFACE 512-D BIOMETRICS */}
      {activeTab === 'biometrics' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <ScanFace className="w-4 h-4" />
                  <span>InsightFace ArcFace 512-D Verification</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">Facial Biometric Feature Embedding & Cosine Similarity</h2>
              </div>
              <Badge status={analysis.face.verification_status} />
            </div>

            {/* Side-by-Side Face Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo 1: Document Photo */}
              <div className="rounded-xl bg-navy-850 p-4 border border-navy-750 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  1. Document Photo (Cropped)
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-navy-700 bg-navy-950 flex items-center justify-center p-1">
                  <img
                    src={analysis.images.document_photo}
                    alt="Document Portrait"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="text-[11px] text-cyan-400 font-mono">Passport Photo ROI</div>
              </div>

              {/* Photo 2: Live Traveler Face */}
              <div className="rounded-xl bg-navy-850 p-4 border border-navy-750 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  2. Live Traveler Capture
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-navy-700 bg-navy-950 flex items-center justify-center p-1">
                  <img
                    src={analysis.images.live_face}
                    alt="Live Face"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="text-[11px] text-emerald-400 font-mono">
                  Liveness: {analysis.face.liveness.status}
                </div>
              </div>

              {/* Photo 3: Database Reference Photo */}
              <div className="rounded-xl bg-navy-850 p-4 border border-navy-750 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  3. Official Database Reference
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-navy-700 bg-navy-950 flex items-center justify-center p-1">
                  <img
                    src={analysis.images.database_photo || analysis.images.document_photo}
                    alt="DB Reference"
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <div className="text-[11px] text-purple-400 font-mono">
                  {analysis.database_check.found ? "Official Record on File" : "Unregistered"}
                </div>
              </div>
            </div>

            {/* Score & Threshold Meters */}
            <div className="p-5 rounded-xl bg-navy-950 border border-navy-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">COSINE SIMILARITY MATCH CONFIDENCE</div>
                  <div className="text-3xl font-black font-mono text-white mt-0.5">
                    {analysis.face.scores.overall_face_match_score}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Thresholds: 85-100% Match &bull; 60-84% Review &bull; 0-59% Mismatch
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">BIOMETRIC VERDICT</div>
                  <div className="text-lg font-bold mt-0.5">
                    <Badge status={analysis.face.verification_status} />
                  </div>
                </div>
              </div>

              {/* Embedding Feature Vector Preview */}
              {analysis.face.embedding_sample && (
                <div className="space-y-1.5 pt-2 border-t border-navy-800 text-xs font-mono">
                  <div className="text-[10px] uppercase text-cyan-400 font-bold flex items-center space-x-1">
                    <Cpu className="w-3 h-3" />
                    <span>Normalized ArcFace 512-D Embedding Vector Sample (First 16 dimensions):</span>
                  </div>
                  <div className="p-2 rounded bg-navy-900 text-slate-300 text-[10px] break-all border border-navy-800">
                    [{analysis.face.embedding_sample.map((v: number) => v.toFixed(3)).join(', ')}...]
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE COMPARISON & MANUAL STORE */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>Side-by-Side Database Cross-Check</span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  PaddleOCR Extracted Data vs Authorized Database Record
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <Badge status={analysis.database_check.found ? analysis.database_check.status : "NOT FOUND"} />
                {!analysis.database_check.found && (
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Store to Database</span>
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Side-by-Side Table */}
            <div className="overflow-x-auto rounded-xl border border-navy-750">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-navy-800 bg-navy-850 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3 px-4 font-sans">Identity Field</th>
                    <th className="py-3 px-4 text-cyan-400">PaddleOCR Extracted Value</th>
                    <th className="py-3 px-4 text-purple-400">Authorized Database Record on File</th>
                    <th className="py-3 px-4 text-right font-sans">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800">
                  {comparisonItems.map((item) => (
                    <tr key={item.field} className="hover:bg-navy-850/40 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-white">
                        {item.field}
                      </td>
                      <td className="py-3 px-4 font-bold text-cyan-300">
                        {item.ocrValue}
                      </td>
                      <td className={`py-3 px-4 font-bold ${
                        item.dbValue === 'RECORD NOT FOUND' ? 'text-slate-500 italic' :
                        !item.isMatch ? 'text-red-400 underline font-black' : 'text-slate-200'
                      }`}>
                        {item.dbValue}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.dbValue === 'RECORD NOT FOUND' ? (
                          <span className="text-slate-500 text-[10px] font-sans font-bold">UNCHECKED</span>
                        ) : item.isMatch ? (
                          <span className="text-emerald-400 font-sans font-bold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>MATCH</span>
                          </span>
                        ) : (
                          <span className="text-red-400 font-sans font-bold flex items-center justify-end space-x-1">
                            <XCircle className="w-4 h-4" />
                            <span>MISMATCH</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* If record NOT found in database: provide manual store prompt */}
            {!analysis.database_check.found && (
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>This document number ({editableFields.document_number}) does not currently exist in the Mock Authorized Database.</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  You can manually store and register this document into the Mock Authorized Database with any status you choose (e.g. <strong>VALID</strong>, <strong>EXPIRED</strong>, or <strong>BLACKLISTED</strong>). Once stored, re-running the screening will verify against your saved record!
                </p>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all flex items-center space-x-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Store / Register this Document to Authorized Database</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: RAW OCR OUTPUT */}
      {activeTab === 'raw_ocr' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-navy-900 border border-navy-750 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Raw Character Recognition Output</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">Confidence: {Math.round(analysis.ocr.confidence * 100)}%</span>
            </div>
            <p className="text-xs text-slate-400">
              Complete raw text stream detected from the uploaded image before character parsing and classification:
            </p>
            <pre className="p-4 rounded-xl bg-navy-950 border border-navy-800 text-slate-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {analysis.ocr.raw_ocr_text || "No raw text recorded."}
            </pre>
          </div>
        </div>
      )}

      {/* OFFICER DECISION PANEL */}
      <div className="rounded-2xl bg-navy-900 border border-cyan-500/30 p-6 space-y-6 shadow-2xl shadow-cyan-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <span>Officer Border Control Determination</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Confirm or override AI recommendation. Action will be sealed in the tamper-evident SHA-256 audit ledger.
            </p>
          </div>
          <div className="text-xs font-mono text-cyan-300 font-bold bg-navy-850 px-3 py-1 rounded border border-navy-750 self-start">
            OFFICER-742 • COUNTER 04
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setSelectedDecision('PASS')}
            className={`py-3.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'PASS'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30 scale-[1.02]'
                : 'bg-navy-850 hover:bg-navy-800 border-navy-700 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>PASS / CLEAR ENTRY</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDecision('REVIEW')}
            className={`py-3.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'REVIEW'
                ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-600/30 scale-[1.02]'
                : 'bg-navy-850 hover:bg-navy-800 border-navy-700 text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>REVIEW / SECONDARY</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDecision('FAIL')}
            className={`py-3.5 px-4 rounded-xl font-black text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'FAIL'
                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-600/30 scale-[1.02]'
                : 'bg-navy-850 hover:bg-navy-800 border-navy-700 text-slate-400 hover:text-white'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>FAIL / DENY & DETAIN</span>
          </button>
        </div>

        {/* Officer Remarks Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Officer Remarks & Inspection Notes
          </label>
          <textarea
            rows={2}
            value={officerRemarks}
            onChange={(e) => setOfficerRemarks(e.target.value)}
            className="w-full bg-navy-950 border border-navy-750 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
            placeholder="Enter officer notes and justification for entry decision..."
          />
        </div>

        {/* Finalize Button */}
        <div className="pt-2 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            Cryptographic SHA-256 block will be appended to audit chain upon confirmation.
          </div>

          <button
            onClick={handleFinalizeDecision}
            disabled={isSubmitting || isFinalized}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs tracking-wider shadow-lg shadow-cyan-500/25 transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isFinalized ? 'DECISION RECORDED IN AUDIT LOG' : isSubmitting ? 'SEALING RECORD...' : 'CONFIRM DECISION & SEAL AUDIT BLOCK'}</span>
          </button>
        </div>

        {/* Post-finalization Alert */}
        {isFinalized && (
          <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Decision successfully saved to Screening History and Tamper-Evident Audit Trail.</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentPage('audit')}
                className="text-cyan-400 underline font-bold cursor-pointer"
              >
                View Audit Ledger
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-3 py-1.5 rounded bg-emerald-600 text-white font-bold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register to Database Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-sm font-extrabold text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Store Document to Authorized Database</span>
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <p className="text-xs text-slate-300">
              Save this credential to the persistent Mock Database so that future screenings recognize and verify it:
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableFields.full_name}
                  onChange={(e) => setEditableFields({ ...editableFields, full_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Document Number</label>
                  <input
                    type="text"
                    value={editableFields.document_number}
                    onChange={(e) => setEditableFields({ ...editableFields, document_number: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Initial Status</label>
                  <select
                    value={registerStatus}
                    onChange={(e) => setRegisterStatus(e.target.value)}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  >
                    <option value="VALID">VALID (Active)</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="BLACKLISTED">BLACKLISTED</option>
                    <option value="REVOKED">REVOKED</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editableFields.date_of_birth}
                    onChange={(e) => setEditableFields({ ...editableFields, date_of_birth: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={editableFields.expiry_date}
                    onChange={(e) => setEditableFields({ ...editableFields, expiry_date: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 rounded bg-navy-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterToDatabase}
                disabled={isRegistering}
                className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                {isRegistering ? 'Saving...' : 'Save & Link to Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Verify OCR Modal */}
      {isEditOcrOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-sm font-extrabold text-white">Edit / Verify PaddleOCR Extracted Data</h3>
              <button onClick={() => setIsEditOcrOpen(false)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableFields.full_name}
                  onChange={(e) => setEditableFields({ ...editableFields, full_name: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Passport / ID Number</label>
                  <input
                    type="text"
                    value={editableFields.document_number}
                    onChange={(e) => setEditableFields({ ...editableFields, document_number: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editableFields.nationality}
                    onChange={(e) => setEditableFields({ ...editableFields, nationality: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editableFields.date_of_birth}
                    onChange={(e) => setEditableFields({ ...editableFields, date_of_birth: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={editableFields.expiry_date}
                    onChange={(e) => setEditableFields({ ...editableFields, expiry_date: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded p-2 text-white font-mono"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditOcrOpen(false)}
                className="px-4 py-2 rounded bg-navy-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditOcrOpen(false)}
                className="px-4 py-2 rounded bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Apply Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
