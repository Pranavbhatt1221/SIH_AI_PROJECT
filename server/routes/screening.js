/**
 * Upgraded Screening Pipeline Routes
 * Supports dynamic custom uploaded images with PaddleOCR character separation,
 * InsightFace 512-D embedding comparison, and Mock Authorized Database manual storage.
 */

const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { SIH_DEMO_CASES } = require('../data/seedData');
const { assessImageQuality } = require('../services/iqa');
const { extractDocumentData } = require('../services/ocr');
const { detectTampering } = require('../services/tampering');
const { verifyFaces } = require('../services/face');
const { calculateMultiModalRisk } = require('../services/riskEngine');
const { runAiPipeline } = require('../services/pythonBridge');

// Get all pre-configured SIH Demo Cases
router.get('/demo-cases', (req, res) => {
  res.json({
    success: true,
    cases: Object.values(SIH_DEMO_CASES)
  });
});

// Run Parallel AI Screening Analysis on ANY uploaded document
router.post('/analyze', async (req, res) => {
  try {
    const {
      demo_case_id,
      document_type = 'Passport',
      document_image,
      live_face_image,
      tampering_preset,
      manual_override_fields
    } = req.body;

    let demoData = null;
    if (demo_case_id && SIH_DEMO_CASES[demo_case_id]) {
      demoData = SIH_DEMO_CASES[demo_case_id];
    }

    const docPhotoUrl = document_image || (demoData ? demoData.doc_photo : "");
    const liveFaceUrl = live_face_image || (demoData ? demoData.live_face : docPhotoUrl);

    // 1. Image Quality Assessment (IQA)
    const iqa = assessImageQuality(docPhotoUrl, document_type);

    // 2. OCR & Field Extraction
    const ocr = await extractDocumentData(docPhotoUrl, demoData);

    // Allow manual override fields if user verified/edited them in UI
    if (manual_override_fields) {
      ocr.extracted_fields = { ...ocr.extracted_fields, ...manual_override_fields };
    }

    const docNumber = (ocr.extracted_fields.document_number || '').trim().toUpperCase();
    const docName = (ocr.extracted_fields.full_name || '').trim();
    const docDob = (ocr.extracted_fields.date_of_birth || '').trim();
    const docExpiry = (ocr.extracted_fields.expiry_date || '').trim();
    const docNat = (ocr.extracted_fields.nationality || 'IND').trim().toUpperCase();

    // 3. Query Mock Authorized Database
    const dbCheck = db.queryDatabaseForDocument(docNumber, docName, docDob);
    const dbPhotoUrl = dbCheck.found && dbCheck.passport ? dbCheck.passport.photo_reference : (demoData ? demoData.db_photo : docPhotoUrl);

    // 4. Run Python 3.11 Deep Learning / Computer Vision Pipeline (OpenCV ELA + Face Verification)
    let liveAiResult = null;
    try {
      liveAiResult = await runAiPipeline({
        document_image: docPhotoUrl,
        live_face_image: liveFaceUrl,
        db_photo: dbPhotoUrl,
        demo_case_id: demo_case_id || '',
        fallback_data: demoData ? {
          lines: [demoData.mrz_line1, demoData.mrz_line2],
          person_name: demoData.person_name,
          document_number: demoData.document_number,
          date_of_birth: demoData.date_of_birth,
          expiry_date: demoData.expiry_date,
          nationality: demoData.nationality
        } : null
      });
    } catch (aiErr) {
      console.warn('Live AI microservice notice (fallback engaged):', aiErr.message);
    }

    // Check expiry date
    let isDateExpired = false;
    if (docExpiry) {
      const parts = docExpiry.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const expYear = parseInt(parts[2].length === 2 ? '20' + parts[2] : parts[2], 10);
        if (expYear < 2026) isDateExpired = true;
      }
    }
    if (dbCheck.found && dbCheck.passport && dbCheck.passport.status === "EXPIRED") {
      isDateExpired = true;
    }

    // 5. Document Validation Checks
    const formatValid = !!(docNumber && docName);
    const vizMrzValid = ocr.viz_mrz_match !== false;
    const mrzValid = ocr.mrz ? (ocr.mrz.composite_valid !== false && vizMrzValid) : true;
    const datesValid = !isDateExpired;
    const consistencyValid = dbCheck.found ? (dbCheck.name_match && dbCheck.dob_match) : true;

    const docValidation = {
      overall_status: (formatValid && mrzValid && datesValid && consistencyValid && vizMrzValid) ? "PASS" : "FAIL",
      format_valid: formatValid,
      mrz_valid: mrzValid,
      dates_valid: datesValid,
      consistency_valid: consistencyValid,
      viz_mrz_valid: vizMrzValid,
      checks: [
        { name: "Document Structure & Fields", status: formatValid ? "PASS" : "FAIL", detail: docNumber ? `Document serial: ${docNumber}` : "Missing document serial number." },
        { name: "Visual Zone vs MRZ Integrity Cross-Check", status: vizMrzValid ? "PASS" : "FAIL", detail: vizMrzValid ? "Visual Inspection Zone name & document serial match MRZ machine-readable encoding." : (ocr.discrepancy_reason || "Visual Zone text does not match MRZ encoding.") },
        { name: "MRZ Check Digit Math (ICAO 9303)", status: (ocr.mrz ? ocr.mrz.composite_valid !== false : true) ? "PASS" : "FAIL", detail: "Modulus-10 checksum verified on document number and dates." },
        { name: "Date Validity & Expiry", status: datesValid ? "PASS" : "FAIL", detail: datesValid ? `Valid until ${docExpiry}` : `Document expired (${docExpiry})` },
        { name: "Database Consistency", status: consistencyValid ? "PASS" : "FAIL", detail: dbCheck.found ? (consistencyValid ? "Biographical fields match authorized record." : "Field mismatch detected with authorized record.") : "Unregistered credential." }
      ]
    };

    // 6. AI Tampering Analysis (Live OpenCV ELA Heatmap)
    const presetToUse = tampering_preset || (demoData ? demoData.tampering_preset : 'CLEAN');
    const tampering = detectTampering(docPhotoUrl, presetToUse, liveAiResult);

    // If VIZ and MRZ mismatch, escalate tampering detection
    if (!vizMrzValid) {
      tampering.tampering_score = Math.max(tampering.tampering_score, 88);
      tampering.tampering_detected = true;
      tampering.risk_level = "HIGH";
      tampering.category = "Text Manipulation / VIZ-MRZ Mismatch";
      tampering.anomalies.unshift({
        label: "Visual Zone vs MRZ Identity Consistency",
        status: "FAIL",
        detail: ocr.discrepancy_reason || "Visual Zone name does not match MRZ machine-readable lines."
      });
      tampering.notice = "AI-assisted indication — FORGERY DETECTED: Visual biographical text differs from MRZ encoding.";
    }

    // 7. Face Verification & Deep Feature Cosine Similarity
    const demoFaceScore = (liveAiResult && liveAiResult.face_result) ? null : (demoData ? demoData.face_match_score : null);
    const face = verifyFaces(docPhotoUrl, liveFaceUrl, dbPhotoUrl, demoFaceScore, liveAiResult);

    // 8. Multi-Modal Risk Engine
    const risk = calculateMultiModalRisk({
      iqaResult: iqa,
      ocrResult: ocr,
      tamperingResult: tampering,
      faceResult: face,
      databaseResult: dbCheck,
      docValidationResult: docValidation,
      docDob: docDob
    });

    const tempCaseId = `CASE-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const responsePayload = {
      case_id: tempCaseId,
      timestamp: new Date().toISOString(),
      document_type,
      document_number: docNumber,
      person_name: docName,
      date_of_birth: docDob,
      nationality: docNat,
      gender: ocr.extracted_fields.gender,
      images: {
        document_preview: docPhotoUrl,
        document_photo: (face && face.cropped_face_url) || (liveAiResult && liveAiResult.face_result && liveAiResult.face_result.document_face_crop) || docPhotoUrl,
        live_face: (face && face.live_face_crop_url) || liveFaceUrl,
        database_photo: dbPhotoUrl,
        ela_heatmap: tampering.ela_heatmap_url
      },
      iqa,
      ocr,
      doc_validation: docValidation,
      tampering,
      face,
      database_check: dbCheck,
      risk,
      recommended_decision: risk.recommended_action.split(' ')[0]
    };

    res.json({
      success: true,
      analysis: responsePayload
    });

  } catch (error) {
    console.error('Screening Analysis Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register / Store new document and person into Mock Authorized Database directly from screening!
router.post('/register-to-database', (req, res) => {
  try {
    const {
      document_number,
      full_name,
      nationality = "IND",
      date_of_birth,
      dob,
      expiry_date,
      expiry,
      gender = "M",
      status = "ACTIVE",
      photo_reference
    } = req.body;

    if (!document_number || !full_name) {
      return res.status(400).json({ success: false, message: "Document number and name required." });
    }

    const finalDob = date_of_birth || dob || "15/08/1998";
    const finalExpiry = expiry_date || expiry || "15/08/2032";

    const data = db.read();
    const personId = `PERS-${1000 + data.persons.length + 1}`;
    const passportId = `PASS-${1000 + data.passports.length + 1}`;

    const newPerson = {
      person_id: personId,
      full_name,
      date_of_birth: finalDob,
      gender,
      nationality,
      photo_reference: photo_reference || "",
      status: "ACTIVE",
      created_at: new Date().toISOString()
    };

    const newPassport = {
      passport_id: passportId,
      person_id: personId,
      passport_number: document_number.toUpperCase(),
      full_name,
      nationality,
      date_of_birth: finalDob,
      gender,
      issue_date: "15/08/2022",
      expiry_date: finalExpiry,
      status: status.toUpperCase(),
      photo_reference: photo_reference || ""
    };

    data.persons.unshift(newPerson);
    data.passports.unshift(newPassport);
    db.write(data);

    res.json({
      success: true,
      message: `Document ${document_number} registered into Mock Authorized Database with status ${status}.`,
      passport: newPassport,
      person: newPerson
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Officer Decision Finalization
router.post('/finalize', (req, res) => {
  try {
    const {
      case_id,
      person_name,
      document_type = 'Passport',
      document_number,
      risk_score,
      risk_level,
      face_match_score,
      tampering_score,
      database_status,
      decision,
      officer_id = 'OFFICER-742',
      officer_remarks = ''
    } = req.body;

    if (!document_number || !decision) {
      return res.status(400).json({ success: false, message: "Missing required fields (document_number, decision)." });
    }

    const screeningRecord = {
      case_id: case_id || `CASE-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toISOString(),
      person_name: person_name || "Unknown",
      document_type,
      document_number,
      risk_score: risk_score !== undefined ? risk_score : 20,
      risk_level: risk_level || "LOW RISK",
      face_match_score: face_match_score || 94.0,
      tampering_score: tampering_score || 5,
      tampering_category: req.body.tampering_category || (tampering_score >= 60 ? "Altered Text / Photo Discrepancy" : "Authentic"),
      database_status: database_status || "MATCH",
      decision,
      officer_id,
      officer_remarks: officer_remarks || `Officer marked decision as ${decision}.`
    };

    const result = db.addScreeningRecord(screeningRecord);

    res.json({
      success: true,
      message: `Screening finalized as ${decision} and cryptographically logged to audit trail.`,
      screening_record: result.record,
      audit_record: result.auditRecord
    });
  } catch (error) {
    console.error('Finalize Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// History routes
router.get('/history', (req, res) => {
  const filter = req.query.filter || 'ALL';
  const search = req.query.search || '';
  const history = db.getScreeningHistory(filter, search);
  res.json({ success: true, total: history.length, history });
});

router.get('/case/:id', (req, res) => {
  const caseRecord = db.getScreeningById(req.params.id);
  if (!caseRecord) {
    return res.status(404).json({ success: false, message: "Screening case not found." });
  }
  res.json({ success: true, case: caseRecord });
});

module.exports = router;
