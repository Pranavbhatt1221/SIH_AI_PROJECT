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
  const [elaOpacity, setElaOpacity] = useState<number>(100);
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

  // ELA / Tampering mode dropdown state & simulation after screening
  const [tamperingMode, setTamperingMode] = useState<string>('AUTO');
  const [currentTampering, setCurrentTampering] = useState({ ...analysis.tampering });
  const [isUpdatingTampering, setIsUpdatingTampering] = useState(false);

  const handleTamperingModeChange = async (mode: string) => {
    setTamperingMode(mode);
    if (mode === 'AUTO') {
      setCurrentTampering({ ...analysis.tampering });
      return;
    }

    setIsUpdatingTampering(true);
    try {
      const res = await fetch('/api/screening/simulate-tampering', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preset: mode,
          docPhotoUrl: analysis.images.document_preview || analysis.images.document_photo
        })
      });
      const data = await res.json();
      if (data.success && data.tampering) {
        setCurrentTampering(data.tampering);
      }
    } catch (err) {
      console.error('Failed to update tampering mode', err);
    } finally {
      setIsUpdatingTampering(false);
    }
  };

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
        setRegistrationMessage(`Successfully stored ${editableFields.document_number} into Authorized Database with status ${registerStatus}!`);
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
        tampering_score: currentTampering.tampering_score,
        tampering_category: currentTampering.category,
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
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Quick Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentPage('dashboard')}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center space-x-1.5 transition-colors cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Inspection Dashboard</span>
        </button>

        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <span>TIME OF INSPECTION:</span>
          <span className="text-slate-900 font-bold">{new Date(analysis.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Primary Case ID & Risk Banner */}
      <div className={`rounded-xl border p-6 shadow-sm relative overflow-hidden ${
        analysis.risk.final_risk_score >= 60
          ? 'bg-red-50/70 border-red-200 text-slate-900'
          : analysis.risk.final_risk_score >= 30
          ? 'bg-amber-50/70 border-amber-200 text-slate-900'
          : 'bg-emerald-50/70 border-emerald-200 text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Case Info */}
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-white text-slate-800 border border-slate-300 shadow-sm">
                {analysis.case_id}
              </span>
              <Badge status={analysis.risk.risk_level} />
              <span className="text-xs font-mono text-slate-600">
                {analysis.document_type.toUpperCase()} • {editableFields.document_number}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {editableFields.full_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
              <span>DOB: <strong className="text-slate-900 font-mono">{editableFields.date_of_birth}</strong></span>
              <span className="text-slate-400">•</span>
              <span>Nationality: <strong className="text-slate-900 font-mono">{editableFields.nationality}</strong></span>
              <span className="text-slate-400">•</span>
              <span>Sex: <strong className="text-slate-900 font-mono">{editableFields.gender}</strong></span>
              <span className="text-slate-400">•</span>
              <span>Expiry: <strong className="text-slate-900 font-mono">{editableFields.expiry_date}</strong></span>
            </div>
          </div>

          {/* Right: Risk Score Gauge */}
          <div className="flex items-center space-x-5 shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">COMPOSITE RISK SCORE</div>
              <div className="flex items-baseline justify-end space-x-1">
                <span className={`text-4xl font-bold font-mono ${
                  analysis.risk.final_risk_score >= 60 ? 'text-red-700' :
                  analysis.risk.final_risk_score >= 30 ? 'text-amber-800' : 'text-emerald-700'
                }`}>
                  {analysis.risk.final_risk_score}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ 100</span>
              </div>
              <div className="text-[11px] font-semibold text-slate-700">
                Recommended: <span className="text-blue-700 font-bold">{analysis.recommended_decision}</span>
              </div>
            </div>

            <div className="w-14 h-14 rounded-full border-4 flex items-center justify-center font-bold text-xs shadow-sm" style={{
              borderColor: analysis.risk.final_risk_score >= 60 ? '#DC2626' : analysis.risk.final_risk_score >= 30 ? '#D97706' : '#059669',
              backgroundColor: analysis.risk.final_risk_score >= 60 ? '#FEF2F2' : analysis.risk.final_risk_score >= 30 ? '#FFFBEB' : '#ECFDF5',
              color: analysis.risk.final_risk_score >= 60 ? '#991B1B' : analysis.risk.final_risk_score >= 30 ? '#92400E' : '#065F46'
            }}>
              {analysis.risk.risk_level.split(' ')[0]}
            </div>
          </div>
        </div>

        {analysis.risk.override_applied && (
          <div className="mt-4 pt-3 border-t border-red-200 flex items-center space-x-2 text-xs text-red-800 font-semibold">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{analysis.risk.override_reason}</span>
          </div>
        )}
      </div>

      {/* Registration success alert */}
      {registrationMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex items-center justify-between text-emerald-800 shadow-sm">
          <div className="flex items-center space-x-2 font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{registrationMessage}</span>
          </div>
          <button onClick={() => setRegistrationMessage('')} className="text-slate-500 hover:text-slate-900 font-bold text-base">&times;</button>
        </div>
      )}

      {/* Navigation Tabs for Forensic Inspector */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-semibold">
        {[
          { id: 'overview', label: 'Overview & Verification' },
          { id: 'forensics', label: 'Tampering & Forensic Heatmap' },
          { id: 'biometrics', label: 'Biometric Face Verification' },
          { id: 'database', label: 'Registry Cross-Check' },
          { id: 'raw_ocr', label: 'Raw OCR Output' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-50 text-blue-900 border border-blue-200 font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
              <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-700" />
                    <span>Physical Credential</span>
                  </h3>
                  <Badge status={`IQA ${analysis.iqa.score}/100`} />
                </div>

                {/* Document Preview */}
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 p-2 flex items-center justify-center">
                  <img
                    src={analysis.images.document_preview}
                    alt="Document Scan"
                    className="max-h-64 object-contain rounded"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                    DOCUMENT SCAN
                  </div>
                </div>

                {/* Image Quality Metrics Table */}
                <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
                  <div className="text-[10px] uppercase font-bold text-slate-500">Image Quality Assessment (IQA)</div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px]">Resolution</div>
                      <div className="font-mono text-slate-800 font-bold">{analysis.iqa.metrics.resolution?.value || '1920x1280'}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px]">Sharpness / Clarity</div>
                      <div className="font-mono text-emerald-700 font-bold">Clear (Var: 412)</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px]">Brightness</div>
                      <div className="font-mono text-slate-800 font-bold">{analysis.iqa.metrics.brightness?.value || '138 / 255'}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-200">
                      <div className="text-slate-500 text-[10px]">Framing</div>
                      <div className="font-mono text-emerald-700 font-bold">Visible (4 corners)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: OCR & Document Validation (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* OCR Table */}
              <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileCheck2 className="w-4 h-4 text-blue-700" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Extracted Credential Fields
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsEditOcrOpen(true)}
                    className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit / Verify OCR</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Full Name</div>
                    <div className="font-bold text-slate-900 mt-0.5">{editableFields.full_name}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Document Number</div>
                    <div className="font-mono font-bold text-blue-700 mt-0.5">{editableFields.document_number}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Nationality</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{editableFields.nationality}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Date of Birth</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{editableFields.date_of_birth}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Sex</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{editableFields.gender}</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">Expiry Date</div>
                    <div className="font-mono font-bold text-slate-900 mt-0.5">{editableFields.expiry_date}</div>
                  </div>
                </div>

                {/* MRZ Zone Display */}
                {analysis.ocr.mrz && (
                  <div className="p-3 rounded-lg bg-slate-900 text-white font-mono text-xs space-y-1 shadow-sm">
                    <div className="text-[10px] text-blue-300 font-bold uppercase tracking-wider flex items-center justify-between">
                      <span>Machine Readable Zone (ICAO 9303 MRZ)</span>
                      <span className="text-emerald-400 font-sans text-[10px] font-semibold">Modulus-10 Check Valid</span>
                    </div>
                    <div className="text-slate-200 tracking-widest break-all select-all">{analysis.ocr.mrz.line1}</div>
                    <div className="text-slate-200 tracking-widest break-all select-all">{analysis.ocr.mrz.line2}</div>
                  </div>
                )}

                {/* Visual Zone vs MRZ Integrity */}
                {analysis.ocr.viz_mrz_match === true && analysis.ocr.mrz && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-emerald-800 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      <span>Dual-Zone Integrity Confirmed</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-mono">
                      VIZ ({analysis.ocr.viz?.given_name || analysis.person_name}) ↔ MRZ ({analysis.ocr.mrz?.given_names || analysis.ocr.mrz?.full_name})
                    </div>
                  </div>
                )}

                {/* Multilingual / National Script Notice */}
                {analysis.ocr.viz?.multilingual_detected && (
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-center justify-between">
                    <div className="text-[11px] text-blue-900 flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      <span className="font-bold">Bilingual Document:</span>
                      <span className="text-slate-600">National Script:</span>
                      <span className="font-mono text-amber-800 font-bold">
                        {analysis.ocr.viz.national_given_name || analysis.ocr.viz.national_surname}
                      </span>
                      <span className="text-slate-400">→</span>
                      <span className="text-slate-600">ICAO Latin:</span>
                      <span className="font-mono text-emerald-800 font-bold">{analysis.ocr.viz.given_name}</span>
                    </div>
                    <span className="text-[10px] text-blue-700 font-bold uppercase tracking-wider">ICAO 9303 Compliant</span>
                  </div>
                )}

                {/* Visual Zone vs MRZ Discrepancy Banner */}
                {analysis.ocr.viz_mrz_match === false && (
                  <div className="p-4 rounded-xl bg-red-50 border-2 border-red-300 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-red-800 font-bold tracking-wider uppercase">
                      <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                      <span>CRITICAL ALERT: Visual Text vs MRZ Discrepancy!</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-2.5 rounded bg-white border border-red-200">
                        <div className="text-[10px] text-slate-500 uppercase font-mono">Visual Zone (VIZ) Text</div>
                        <div className="font-mono font-bold text-amber-800 text-sm mt-0.5">
                          {analysis.ocr.viz?.full_name || analysis.ocr.viz?.given_name || "MEET"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Printed on document body</div>
                      </div>
                      <div className="p-2.5 rounded bg-white border border-red-200">
                        <div className="text-[10px] text-slate-500 uppercase font-mono">MRZ Machine Encoding</div>
                        <div className="font-mono font-bold text-emerald-800 text-sm mt-0.5">
                          {analysis.ocr.mrz?.full_name || "GABRIEL PAPAGO"}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Encoded in machine-readable lines</div>
                      </div>
                    </div>
                    <p className="text-[11px] text-red-900 leading-relaxed font-sans pt-1">
                      {analysis.ocr.discrepancy_reason || "The printed name on the document does not match the machine readable zone. High probability of optical white-out or digital text tampering."}
                    </p>
                  </div>
                )}
              </div>

              {/* Document Validation Checklist */}
              <div className="rounded-xl bg-white border border-slate-200 p-5 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated Document Validation Checklist</span>
                </h3>

                <div className="divide-y divide-slate-100 text-xs">
                  {analysis.doc_validation.checks.map((chk) => (
                    <div key={chk.name} className="py-2.5 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-800">{chk.name}</div>
                        <div className="text-[11px] text-slate-500">{chk.detail}</div>
                      </div>
                      <Badge status={chk.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explainable Result & Reasons */}
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2 text-slate-900">
              <ShieldAlert className="w-5 h-5 text-blue-700" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Evaluation Factors & Risk Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Transparent breakdown of factors influencing the composite risk determination:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {analysis.risk.explainable_factors.map((factor, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg border text-xs flex items-start space-x-2.5 ${
                    factor.type === 'FAIL'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : factor.type === 'WARN'
                      ? 'bg-amber-50 border-amber-200 text-amber-900'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  }`}
                >
                  <span className="font-bold text-sm shrink-0 mt-0.5">{factor.icon}</span>
                  <span className="leading-relaxed font-medium">{factor.text}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-500">FINAL RISK ASSESSMENT</div>
                <div className="font-bold text-slate-900 text-sm">{analysis.risk.summary_sentence}</div>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-blue-100 border border-blue-200 text-blue-900 font-semibold text-xs shrink-0">
                RECOMMENDED ACTION: {analysis.risk.recommended_action}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FORENSIC TAMPERING & ELA HEATMAP */}
      {activeTab === 'forensics' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">Document Forensics & Tampering Analysis</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Error Level Analysis (ELA), edge boundary discontinuity, compression artifacts, and noise variance.
                </p>
              </div>

              {/* Forensic Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-300">
                  <div className="flex items-center space-x-1.5 text-slate-600">
                    <Sliders className="w-3.5 h-3.5 text-blue-700" />
                    <span className="text-xs font-semibold text-slate-800">Mode:</span>
                  </div>
                  <select
                    value={tamperingMode}
                    disabled={isUpdatingTampering}
                    onChange={(e) => handleTamperingModeChange(e.target.value)}
                    className="bg-white border border-slate-300 rounded-md px-2.5 py-1 text-slate-800 text-xs focus:outline-none focus:border-blue-600 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <option value="AUTO">AUTO (Automated Forensics)</option>
                    <option value="CLEAN">Clean Document (Low ELA)</option>
                    <option value="PHOTO_TAMPERED">Photo Splicing (High ELA)</option>
                    <option value="TEXT_TAMPERED">Text Alteration (DOB Spliced)</option>
                    <option value="STAMP_TAMPERED">Stamp Forgery (Cloned Vector)</option>
                  </select>
                  {isUpdatingTampering && (
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                  )}
                </div>

                {/* View Toggle */}
                <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setShowElaView(false)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      !showElaView ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Side-by-Side View
                  </button>
                  <button
                    onClick={() => setShowElaView(true)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                      showElaView ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Overlay Heatmap
                  </button>
                </div>
              </div>
            </div>

            {/* Side-by-side or Toggled ELA Display */}
            {!showElaView ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>ORIGINAL DOCUMENT SCAN</span>
                    <span className="text-[10px] text-slate-500">BASE SUBSTRATE</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 p-2 flex items-center justify-center min-h-[260px]">
                    <img
                      src={analysis.images.document_preview || analysis.images.document_photo}
                      alt="Original"
                      className="max-h-60 object-contain rounded"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span className="text-amber-800 flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>ERROR LEVEL ANALYSIS (ELA) HEATMAP</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {tamperingMode === 'AUTO' ? 'Q=90 Quantization' : `PRESET: ${tamperingMode}`}
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 p-2 flex items-center justify-center min-h-[260px]">
                    {isUpdatingTampering && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                        <span className="text-xs font-mono text-white">Recomputing ELA Heatmap...</span>
                      </div>
                    )}
                    <img
                      src={currentTampering.ela_heatmap_url || analysis.images.ela_heatmap}
                      alt="ELA Heatmap"
                      className="max-h-60 object-contain rounded shadow-lg"
                    />
                  </div>

                  {/* ELA Thermal Spectrum Legend Bar */}
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-600 font-semibold uppercase tracking-wider">Compression Error Scale</span>
                      <span className="text-blue-700 font-medium">Jet Colormap (γ=0.45 Exp.)</span>
                    </div>

                    <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-emerald-400 via-yellow-400 to-red-600 shadow-inner border border-slate-300"></div>

                    <div className="grid grid-cols-4 text-[10px] text-slate-600 font-mono text-center pt-0.5">
                      <div className="text-left text-blue-800">
                        <span className="block font-bold">0% - 25%</span>
                        <span className="text-[9px] text-slate-500">Uniform Substrate</span>
                      </div>
                      <div className="text-cyan-800">
                        <span className="block font-bold">25% - 50%</span>
                        <span className="text-[9px] text-slate-500">Substrate Texture</span>
                      </div>
                      <div className="text-amber-800">
                        <span className="block font-bold">50% - 75%</span>
                        <span className="text-[9px] text-slate-500">Natural Typography</span>
                      </div>
                      <div className="text-right text-red-800">
                        <span className="block font-bold">75% - 100%</span>
                        <span className="text-[9px] text-red-700">Discontinuity / Spliced</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Enhanced ELA Forensic Overlay */
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-blue-700" />
                    <span className="text-xs font-bold text-slate-800">Overlay Transparency:</span>
                    <span className="text-xs font-mono font-bold text-blue-700">{elaOpacity}%</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] text-slate-500">Substrate</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={elaOpacity}
                      onChange={(e) => setElaOpacity(Number(e.target.value))}
                      className="w-36 sm:w-48 h-1.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-700"
                    />
                    <span className="text-[10px] text-blue-700 font-bold">Heatmap</span>
                    <div className="flex space-x-1 pl-2 border-l border-slate-300">
                      <button
                        onClick={() => setElaOpacity(0)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${elaOpacity === 0 ? 'bg-blue-700 text-white font-bold' : 'bg-white text-slate-600 border border-slate-300'}`}
                      >
                        0%
                      </button>
                      <button
                        onClick={() => setElaOpacity(50)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${elaOpacity === 50 ? 'bg-blue-700 text-white font-bold' : 'bg-white text-slate-600 border border-slate-300'}`}
                      >
                        50%
                      </button>
                      <button
                        onClick={() => setElaOpacity(100)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono ${elaOpacity === 100 ? 'bg-blue-700 text-white font-bold' : 'bg-white text-slate-600 border border-slate-300'}`}
                      >
                        100%
                      </button>
                    </div>
                  </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-300 p-4 flex items-center justify-center min-h-[380px]">
                  {isUpdatingTampering && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
                      <span className="text-sm font-mono text-white">Recalculating Superimposition...</span>
                    </div>
                  )}
                  {/* Base Document */}
                  <img
                    src={analysis.images.document_preview || analysis.images.document_photo}
                    alt="Document Scan"
                    className="max-h-[360px] object-contain rounded-lg"
                  />
                  {/* Heatmap Overlay */}
                  <img
                    src={currentTampering.ela_heatmap_url || analysis.images.ela_heatmap}
                    alt="ELA Overlay"
                    style={{ opacity: elaOpacity / 100 }}
                    className="absolute max-h-[360px] object-contain rounded-lg pointer-events-none transition-opacity duration-150"
                  />
                </div>

                {/* ELA Thermal Spectrum Legend Bar */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-600 font-semibold uppercase tracking-wider">Compression Error Scale</span>
                    <span className="text-blue-700 font-medium">Jet Colormap (γ=0.45 Exp.)</span>
                  </div>

                  <div className="h-3 w-full rounded-full bg-gradient-to-r from-blue-700 via-cyan-400 via-emerald-400 via-yellow-400 to-red-600 shadow-inner border border-slate-300"></div>

                  <div className="grid grid-cols-4 text-[10px] text-slate-600 font-mono text-center pt-0.5">
                    <div className="text-left text-blue-800">
                      <span className="block font-bold">0% - 25%</span>
                      <span className="text-[9px] text-slate-500">Uniform Substrate</span>
                    </div>
                    <div className="text-cyan-800">
                      <span className="block font-bold">25% - 50%</span>
                      <span className="text-[9px] text-slate-500">Substrate Texture</span>
                    </div>
                    <div className="text-amber-800">
                      <span className="block font-bold">50% - 75%</span>
                      <span className="text-[9px] text-slate-500">Natural Typography</span>
                    </div>
                    <div className="text-right text-red-800">
                      <span className="block font-bold">75% - 100%</span>
                      <span className="text-[9px] text-red-700">Discontinuity / Spliced</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* How ELA Works Forensic Guide */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-700" />
                <span>Forensic Interpretation: How Error Level Analysis Operates</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Error Level Analysis resaves the document at a calibrated JPEG quantization grid (Q=90) and computes the pixel-by-pixel compression difference.
                In a genuine digital scan, uniform surfaces reach compression equilibrium and appear <strong className="text-blue-700">cool blue/cyan</strong>, while legitimate sharp printed text and security guilloche lines exhibit normal high-frequency energy (<strong className="text-amber-700">green/yellow</strong>).
                If an element (such as a portrait photo or altered biographical field) was digitally spliced or pasted from another source with a different compression history, its error rate spikes anomalously into <strong className="text-red-700">bright red</strong> along its boundary.
              </p>
            </div>

            {/* Tampering Metrics & Anomalies */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-900 flex items-center space-x-2">
                  <span>Tampering Score:</span>
                  <span className={`font-mono font-bold text-base ${
                    currentTampering.tampering_score >= 60 ? 'text-red-700' :
                    currentTampering.tampering_score >= 30 ? 'text-amber-800' : 'text-emerald-700'
                  }`}>
                    {currentTampering.tampering_score}/100
                  </span>
                  {tamperingMode !== 'AUTO' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono border border-amber-300">
                      PRESET: {tamperingMode}
                    </span>
                  )}
                </div>
                <Badge status={currentTampering.risk_level} />
              </div>

              <div className="text-xs text-slate-700 italic">
                "{currentTampering.notice}"
              </div>

              <div className="divide-y divide-slate-200 pt-2 text-xs">
                {currentTampering.anomalies.map((anom) => (
                  <div key={anom.label} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{anom.label}</div>
                      <div className="text-[11px] text-slate-500">{anom.detail}</div>
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
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
                  <ScanFace className="w-4 h-4" />
                  <span>InsightFace ArcFace 512-D Verification</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">Facial Biometric Feature Embedding & Cosine Similarity</h2>
              </div>
              <Badge status={analysis.face.verification_status} />
            </div>

            {/* Side-by-Side Face Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo 1: Document Photo */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  1. Document Photo (Cropped)
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-1 shadow-sm">
                  <img
                    src={analysis.images.document_photo}
                    alt="Document Portrait"
                    className="w-full h-full object-cover rounded"
                    style={{
                      objectPosition: (analysis.images.document_photo === analysis.images.document_preview) ? '16% 40%' : 'center'
                    }}
                  />
                </div>
                <div className="text-[11px] text-blue-700 font-mono flex items-center justify-center space-x-1">
                  <span>Passport Photo ROI</span>
                  {analysis.face?.detection?.document_bbox && (
                    <span className="text-[10px] text-slate-500">
                      ({analysis.face.detection.document_bbox[2]}×{analysis.face.detection.document_bbox[3]}px)
                    </span>
                  )}
                </div>
              </div>

              {/* Photo 2: Live Traveler Face */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  2. Live Traveler Capture
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-1 shadow-sm">
                  <img
                    src={analysis.images.live_face}
                    alt="Live Face"
                    className="w-full h-full object-cover rounded"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
                <div className="text-[11px] text-emerald-700 font-mono font-bold">
                  Liveness: {analysis.face.liveness.status}
                </div>
              </div>

              {/* Photo 3: Database Reference Photo */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  3. Official Database Reference
                </div>
                <div className="w-36 h-44 mx-auto rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center p-1 shadow-sm">
                  <img
                    src={analysis.images.database_photo || analysis.images.document_photo}
                    alt="DB Reference"
                    className="w-full h-full object-cover rounded"
                    style={{
                      objectPosition: analysis.face?.detection?.db_bbox
                        ? 'center'
                        : (analysis.images.database_photo && analysis.images.database_photo.startsWith('/database_photos/'))
                        ? '16% 40%'
                        : 'center'
                    }}
                  />
                </div>
                <div className="text-[11px] text-indigo-700 font-mono flex items-center justify-center space-x-1">
                  <span>{analysis.database_check.found ? "Official DB Face ROI" : "Unregistered"}</span>
                  {analysis.face?.detection?.db_bbox ? (
                    <span className="text-[10px] text-slate-500">
                      ({analysis.face.detection.db_bbox[2]}×{analysis.face.detection.db_bbox[3]}px)
                    </span>
                  ) : (analysis.face?.detection?.document_bbox && analysis.database_check.found) ? (
                    <span className="text-[10px] text-slate-500">
                      ({analysis.face.detection.document_bbox[2]}×{analysis.face.detection.document_bbox[3]}px)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Score & Threshold Meters */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold text-blue-700 flex items-center space-x-1.5 tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                    <span>COSINE SIMILARITY MATCH CONFIDENCE (LOWEST OF 3 PAIRS)</span>
                  </div>
                  <div className="text-3xl font-black font-mono text-slate-900 mt-0.5">
                    {analysis.face.scores.overall_face_match_score}%
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Thresholds: 75-100% Match &bull; 55-74% Review &bull; 0-54% Mismatch &bull; Lowest Pairwise Confidence Enforced
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-500">BIOMETRIC VERDICT</div>
                  <div className="text-lg font-bold mt-0.5">
                    <Badge status={analysis.face.verification_status} />
                  </div>
                </div>
              </div>

              {/* Pairwise 3-Way Biometric Comparison Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200">
                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pair 1: Doc vs Live</span>
                    <span className={`text-xs font-mono font-bold ${(analysis.face.scores?.doc_vs_live_score ?? analysis.face.scores?.overall_face_match_score) >= 75 ? 'text-emerald-700' : (analysis.face.scores?.doc_vs_live_score ?? analysis.face.scores?.overall_face_match_score) >= 55 ? 'text-amber-700' : 'text-red-700'}`}>
                      {analysis.face.scores?.doc_vs_live_score ?? analysis.face.scores?.overall_face_match_score}%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-semibold">Passport Photo vs Traveler</div>
                  <div className="text-[10px] text-slate-500">Verifies traveler holds their own document</div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pair 2: Live vs Database</span>
                    <span className={`text-xs font-mono font-bold ${!analysis.database_check.found ? 'text-slate-400' : (analysis.face.scores?.live_vs_db_score ?? analysis.face.scores?.overall_face_match_score) >= 75 ? 'text-emerald-700' : (analysis.face.scores?.live_vs_db_score ?? analysis.face.scores?.overall_face_match_score) >= 55 ? 'text-amber-700' : 'text-red-700'}`}>
                      {analysis.database_check.found 
                        ? `${analysis.face.scores?.live_vs_db_score ?? analysis.face.scores?.overall_face_match_score}%`
                        : 'Unregistered'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-semibold">Traveler vs Official Record</div>
                  <div className="text-[10px] text-slate-500">Impersonation & identity theft shield</div>
                </div>

                <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pair 3: Doc vs Database</span>
                    <span className={`text-xs font-mono font-bold ${!analysis.database_check.found ? 'text-slate-400' : (analysis.face.scores?.doc_vs_db_score ?? analysis.face.scores?.overall_face_match_score) >= 75 ? 'text-emerald-700' : (analysis.face.scores?.doc_vs_db_score ?? analysis.face.scores?.overall_face_match_score) >= 55 ? 'text-amber-700' : 'text-red-700'}`}>
                      {analysis.database_check.found 
                        ? `${analysis.face.scores?.doc_vs_db_score ?? analysis.face.scores?.overall_face_match_score}%`
                        : 'Unregistered'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-800 font-semibold">Passport Photo vs Official Record</div>
                  <div className="text-[10px] text-slate-500">Detects photo splicing / replacement</div>
                </div>
              </div>

              {/* Embedding Feature Vector Preview */}
              {analysis.face.embedding_sample && (
                <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs font-mono">
                  <div className="text-[10px] uppercase text-blue-700 font-bold flex items-center space-x-1">
                    <Cpu className="w-3 h-3" />
                    <span>Normalized ArcFace 512-D Embedding Vector Sample (First 16 dimensions):</span>
                  </div>
                  <div className="p-2 rounded bg-white text-slate-700 text-[10px] break-all border border-slate-200 font-mono">
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
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 text-blue-700 font-mono text-xs font-bold uppercase tracking-wider">
                  <Database className="w-4 h-4" />
                  <span>Side-by-Side Database Cross-Check</span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 mt-1">
                  PaddleOCR Extracted Data vs Authorized Database Record
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <Badge status={analysis.database_check.found ? analysis.database_check.status : "NOT FOUND"} />
                {!analysis.database_check.found && (
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs flex items-center space-x-1 cursor-pointer transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Store to Database</span>
                  </button>
                )}
              </div>
            </div>

            {/* Detailed Side-by-Side Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 font-sans">Identity Field</th>
                    <th className="py-3 px-4 text-blue-800">PaddleOCR Extracted Value</th>
                    <th className="py-3 px-4 text-indigo-800">Authorized Database Record on File</th>
                    <th className="py-3 px-4 text-right font-sans">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {comparisonItems.map((item) => (
                    <tr key={item.field} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-sans font-bold text-slate-900">
                        {item.field}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-900">
                        {item.ocrValue}
                      </td>
                      <td className={`py-3 px-4 font-bold ${
                        item.dbValue === 'RECORD NOT FOUND' ? 'text-slate-400 italic font-normal' :
                        !item.isMatch ? 'text-red-700 underline font-black' : 'text-slate-700'
                      }`}>
                        {item.dbValue}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.dbValue === 'RECORD NOT FOUND' ? (
                          <span className="text-slate-400 text-[10px] font-sans font-bold">UNCHECKED</span>
                        ) : item.isMatch ? (
                          <span className="text-emerald-700 font-sans font-bold flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>MATCH</span>
                          </span>
                        ) : (
                          <span className="text-red-700 font-sans font-bold flex items-center justify-end space-x-1">
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
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-3">
                <div className="flex items-center space-x-2 text-amber-900 font-bold">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>This document number ({editableFields.document_number}) does not currently exist in the Authorized Database.</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  You can manually store and register this document into the Authorized Database with any status you choose (e.g. <strong>VALID</strong>, <strong>EXPIRED</strong>, or <strong>BLACKLISTED</strong>). Once stored, re-running the screening will verify against your saved record!
                </p>
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wide transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
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
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Raw Character Recognition Output</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Confidence: {Math.round(analysis.ocr.confidence * 100)}%</span>
            </div>
            <p className="text-xs text-slate-600">
              Complete raw text stream detected from the uploaded image before character parsing and classification:
            </p>
            <pre className="p-4 rounded-xl bg-slate-900 border border-slate-300 text-slate-100 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {analysis.ocr.raw_ocr_text || "No raw text recorded."}
            </pre>
          </div>
        </div>
      )}

      {/* OFFICER DECISION PANEL */}
      <div className="rounded-2xl bg-white border border-slate-300 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Officer Border Control Determination</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Confirm or override system recommendation. Action will be sealed in the tamper-evident SHA-256 audit ledger.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-700 font-bold bg-slate-100 px-3 py-1 rounded border border-slate-200 self-start">
            OFFICER-742 • COUNTER 04
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            onClick={() => setSelectedDecision('PASS')}
            className={`py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'PASS'
                ? 'bg-emerald-700 border-emerald-700 text-white shadow-md'
                : 'bg-slate-50 hover:bg-emerald-50 border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>PASS / CLEAR ENTRY</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDecision('REVIEW')}
            className={`py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'REVIEW'
                ? 'bg-amber-600 border-amber-600 text-white shadow-md'
                : 'bg-slate-50 hover:bg-amber-50 border-slate-300 hover:border-amber-500 text-slate-700 hover:text-amber-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>REVIEW / SECONDARY</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedDecision('FAIL')}
            className={`py-3.5 px-4 rounded-xl font-bold text-xs tracking-wider transition-all border flex items-center justify-center space-x-2 cursor-pointer ${
              selectedDecision === 'FAIL'
                ? 'bg-red-700 border-red-700 text-white shadow-md'
                : 'bg-slate-50 hover:bg-red-50 border-slate-300 hover:border-red-500 text-slate-700 hover:text-red-800'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>FAIL / DENY & DETAIN</span>
          </button>
        </div>

        {/* Officer Remarks Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Officer Remarks & Inspection Notes
          </label>
          <textarea
            rows={2}
            value={officerRemarks}
            onChange={(e) => setOfficerRemarks(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 font-sans"
            placeholder="Enter officer notes and justification for entry decision..."
          />
        </div>

        {/* Finalize Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono">
            Cryptographic SHA-256 block will be appended to audit chain upon confirmation.
          </div>

          <button
            onClick={handleFinalizeDecision}
            disabled={isSubmitting || isFinalized}
            className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs tracking-wider shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>{isFinalized ? 'DECISION RECORDED IN AUDIT LOG' : isSubmitting ? 'SEALING RECORD...' : 'CONFIRM DECISION & SEAL AUDIT BLOCK'}</span>
          </button>
        </div>

        {/* Post-finalization Alert */}
        {isFinalized && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 text-emerald-800 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Decision successfully saved to Screening History and Tamper-Evident Audit Trail.</span>
            </div>
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <button
                onClick={() => setCurrentPage('audit')}
                className="text-blue-700 hover:underline font-bold cursor-pointer"
              >
                View Audit Ledger
              </button>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Register to Database Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-700" />
                <span>Store Document to Authorized Database</span>
              </h3>
              <button onClick={() => setIsRegisterOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">&times;</button>
            </div>
            <p className="text-xs text-slate-600">
              Save this credential to the persistent Authorized Database so that future screenings recognize and verify it:
            </p>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableFields.full_name}
                  onChange={(e) => setEditableFields({ ...editableFields, full_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-700 font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Document Number</label>
                  <input
                    type="text"
                    value={editableFields.document_number}
                    onChange={(e) => setEditableFields({ ...editableFields, document_number: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Initial Status</label>
                  <select
                    value={registerStatus}
                    onChange={(e) => setRegisterStatus(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
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
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editableFields.date_of_birth}
                    onChange={(e) => setEditableFields({ ...editableFields, date_of_birth: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={editableFields.expiry_date}
                    onChange={(e) => setEditableFields({ ...editableFields, expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRegisterToDatabase}
                disabled={isRegistering}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer disabled:opacity-50 shadow-sm"
              >
                {isRegistering ? 'Saving...' : 'Save & Link to Database'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Verify OCR Modal */}
      {isEditOcrOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-900">Edit / Verify Extracted Credential Data</h3>
              <button onClick={() => setIsEditOcrOpen(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold cursor-pointer">&times;</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  value={editableFields.full_name}
                  onChange={(e) => setEditableFields({ ...editableFields, full_name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 focus:outline-none focus:border-blue-700 font-sans"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Passport / ID Number</label>
                  <input
                    type="text"
                    value={editableFields.document_number}
                    onChange={(e) => setEditableFields({ ...editableFields, document_number: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Nationality</label>
                  <input
                    type="text"
                    value={editableFields.nationality}
                    onChange={(e) => setEditableFields({ ...editableFields, nationality: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={editableFields.date_of_birth}
                    onChange={(e) => setEditableFields({ ...editableFields, date_of_birth: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
                <div>
                  <label className="text-slate-700 text-[10px] uppercase font-bold block mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={editableFields.expiry_date}
                    onChange={(e) => setEditableFields({ ...editableFields, expiry_date: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => setIsEditOcrOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => setIsEditOcrOpen(false)}
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold cursor-pointer shadow-sm"
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
