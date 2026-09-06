/**
 * TypeScript Type Definitions
 * AI Fake Identity & Document Screening System
 */

export type PageView =
  | 'landing'
  | 'dashboard'
  | 'new_screening'
  | 'processing'
  | 'officer_analysis'
  | 'database'
  | 'history'
  | 'audit'
  | 'analytics'
  | 'settings';

export interface ScreeningCase {
  case_id: string;
  timestamp: string;
  person_name: string;
  document_type: string;
  document_number: string;
  risk_score: number;
  risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
  face_match_score: number;
  tampering_score: number;
  database_status: string;
  decision: 'PASS' | 'REVIEW' | 'FAIL';
  officer_id: string;
  officer_remarks: string;
}

export interface DemoCasePreset {
  id: string;
  name: string;
  subtitle: string;
  person_name: string;
  document_type: string;
  document_number: string;
  nationality: string;
  date_of_birth: string;
  database_dob?: string;
  gender: string;
  issue_date: string;
  expiry_date: string;
  mrz_line1: string;
  mrz_line2: string;
  database_status: string;
  tampering_preset: string;
  tampering_score: number;
  face_match_score: number;
  face_verification_status: string;
  liveness_status: string;
  risk_score: number;
  risk_level: string;
  recommended_decision: 'PASS' | 'REVIEW' | 'FAIL';
  doc_photo: string;
  live_face: string;
  db_photo: string;
  explanation: string;
}

export interface AnalysisResult {
  case_id: string;
  timestamp: string;
  document_type: string;
  document_number: string;
  person_name: string;
  date_of_birth: string;
  nationality: string;
  gender: string;
  images: {
    document_preview: string;
    document_photo: string;
    live_face: string;
    database_photo: string;
    ela_heatmap: string;
  };
  iqa: {
    score: number;
    status: 'PASSED' | 'FAILED';
    status_color: string;
    message: string;
    metrics: Record<string, { value: string; score: number; status: string }>;
  };
  ocr: {
    engine: string;
    confidence: number;
    extracted_fields: {
      full_name: string;
      document_number: string;
      nationality: string;
      date_of_birth: string;
      gender: string;
      issue_date: string;
      expiry_date: string;
      document_type: string;
    };
    mrz: any;
    ocr_status: string;
  };
  doc_validation: {
    overall_status: string;
    format_valid: boolean;
    mrz_valid: boolean;
    dates_valid: boolean;
    consistency_valid: boolean;
    checks: Array<{ name: string; status: string; detail: string }>;
  };
  tampering: {
    tampering_score: number;
    risk_level: string;
    tampering_detected: boolean;
    category: string;
    ela_heatmap_url: string;
    anomalies: Array<{ label: string; status: string; detail: string }>;
    notice: string;
  };
  face: {
    engine: string;
    biometric_model: string;
    embedding_size: number;
    detection: {
      document_face_detected: boolean;
      document_face_confidence: number;
      live_face_detected: boolean;
      live_face_confidence: number;
      landmarks_tracked: number;
    };
    liveness: {
      status: string;
      label: string;
      face_centered: boolean;
      face_distance_valid: boolean;
      micro_motion_detected: boolean;
    };
    scores: {
      overall_face_match_score: number;
      doc_vs_live_score: number;
      doc_vs_db_score: number;
      live_vs_db_score: number;
    };
    verification_status: 'MATCH' | 'REVIEW' | 'MISMATCH';
    status_color: string;
    notice: string;
  };
  database_check: {
    found: boolean;
    status: string;
    passport?: any;
    person?: any;
    name_match: boolean;
    dob_match: boolean;
    is_expired: boolean;
    is_revoked: boolean;
    is_blacklisted: boolean;
    watchlist_hit: boolean;
    watchlist_details?: any;
    visas: any[];
  };
  risk: {
    final_risk_score: number;
    risk_level: 'LOW RISK' | 'MEDIUM RISK' | 'HIGH RISK';
    status_color: string;
    recommended_action: string;
    weights_breakdown: Record<string, { weight: string; score: number; contribution: number }>;
    override_applied: boolean;
    override_reason: string;
    explainable_factors: Array<{ type: string; icon: string; text: string }>;
    summary_sentence: string;
  };
  recommended_decision: 'PASS' | 'REVIEW' | 'FAIL';
}

export interface AuditBlock {
  audit_id: string;
  case_id: string;
  timestamp: string;
  officer_id: string;
  document_number: string;
  risk_score: number;
  risk_level: string;
  decision: string;
  remarks: string;
  previous_record_hash: string;
  current_record_hash: string;
}
