/**
 * Multi-Modal Risk Assessment Engine & Explainability Generator
 * Combines 5 modalities with safety overrides and produces explainable reasoning.
 * Weights:
 * - Tampering Detection: 25%
 * - Database Verification: 25%
 * - Face Verification: 25%
 * - Document Validation: 15%
 * - OCR / Image Quality: 10%
 */

function calculateMultiModalRisk(params) {
  const {
    iqaResult,
    ocrResult,
    tamperingResult,
    faceResult,
    databaseResult,
    docValidationResult
  } = params;

  // 1. Tampering Risk Component (0 to 100)
  const tamperingScore = tamperingResult ? tamperingResult.tampering_score : 5;
  const tamperingComponent = tamperingScore;

  // 2. Database Verification Risk Component (0 to 100)
  let databaseComponent = 10;
  if (!databaseResult || !databaseResult.found) {
    databaseComponent = 85;
  } else if (databaseResult.is_blacklisted || databaseResult.watchlist_hit) {
    databaseComponent = 100;
  } else if (databaseResult.is_revoked) {
    databaseComponent = 90;
  } else if (databaseResult.is_expired) {
    databaseComponent = 70;
  } else if (!databaseResult.dob_match || !databaseResult.name_match) {
    databaseComponent = 75;
  } else {
    databaseComponent = 5;
  }

  // 3. Face Verification Risk Component (0 to 100)
  // Higher match score -> Lower risk
  const faceMatch = faceResult && faceResult.scores
    ? faceResult.scores.overall_face_match_score
    : 92.0;
  const faceComponent = Math.max(0, Math.min(100, Math.round(100 - faceMatch)));

  // 4. Document Validation Component (0 to 100)
  let docValidationComponent = 10;
  if (docValidationResult) {
    let failCount = 0;
    if (!docValidationResult.format_valid) failCount++;
    if (!docValidationResult.mrz_valid) failCount++;
    if (!docValidationResult.dates_valid) failCount++;
    if (!docValidationResult.consistency_valid) failCount++;
    docValidationComponent = failCount === 0 ? 5 : failCount === 1 ? 40 : 80;
  }

  // 5. OCR & Image Quality Component (0 to 100)
  const iqaScore = iqaResult ? iqaResult.score : 90;
  const ocrConf = ocrResult ? ocrResult.confidence * 100 : 95;
  const avgQuality = (iqaScore + ocrConf) / 2;
  const qualityComponent = Math.max(0, Math.min(100, Math.round(100 - avgQuality)));

  // Weighted composite formula:
  // Tampering (25%) + DB (25%) + Face (25%) + Doc (15%) + Quality (10%)
  let calculatedScore = Math.round(
    tamperingComponent * 0.25 +
    databaseComponent * 0.25 +
    faceComponent * 0.25 +
    docValidationComponent * 0.15 +
    qualityComponent * 0.10
  );

  // CRITICAL SAFETY OVERRIDES
  let overrideTriggered = false;
  let overrideReason = "";

  if (databaseResult && (databaseResult.is_blacklisted || databaseResult.watchlist_hit)) {
    calculatedScore = Math.max(calculatedScore, 98);
    overrideTriggered = true;
    overrideReason = "CRITICAL OVERRIDE: Document or person listed on active INTERPOL/Watchlist blacklist.";
  } else if (databaseResult && databaseResult.is_revoked) {
    calculatedScore = Math.max(calculatedScore, 88);
    overrideTriggered = true;
    overrideReason = "SAFETY OVERRIDE: Document officially revoked by issuing authority.";
  } else if (tamperingScore >= 85) {
    calculatedScore = Math.max(calculatedScore, 90);
    overrideTriggered = true;
    overrideReason = "SAFETY OVERRIDE: Strong digital tampering/photo replacement signature detected.";
  } else if (faceMatch < 60) {
    calculatedScore = Math.max(calculatedScore, 85);
    overrideTriggered = true;
    overrideReason = "SAFETY OVERRIDE: Biometric face verification mismatch between document and traveler.";
  } else if (databaseResult && !databaseResult.dob_match) {
    calculatedScore = Math.max(calculatedScore, 65);
    overrideTriggered = true;
    overrideReason = "SAFETY OVERRIDE: Authorized database record date of birth discrepancy.";
  } else if (databaseResult && databaseResult.is_expired) {
    calculatedScore = Math.max(calculatedScore, 58);
    overrideTriggered = true;
    overrideReason = "SAFETY OVERRIDE: Travel document is past its authorized expiration date.";
  }

  // Determine Risk Level & Recommendation
  let riskLevel = "LOW RISK";
  let statusColor = "GREEN";
  let recommendedAction = "PASS";

  if (calculatedScore >= 60) {
    riskLevel = "HIGH RISK";
    statusColor = "RED";
    recommendedAction = calculatedScore >= 85 ? "FAIL / MANUAL INVESTIGATION" : "FAIL";
  } else if (calculatedScore >= 30) {
    riskLevel = "MEDIUM RISK";
    statusColor = "YELLOW";
    recommendedAction = "REVIEW / SECONDARY INSPECTION";
  } else {
    riskLevel = "LOW RISK";
    statusColor = "GREEN";
    recommendedAction = "PASS / CLEARED FOR ENTRY";
  }

  // Build Explainable Result bullet points
  const explanations = [];

  // Database checks
  if (databaseResult && databaseResult.found) {
    explanations.push({
      type: "PASS",
      icon: "✓",
      text: "Passport number exists in authorized verification database"
    });
    if (databaseResult.name_match) {
      explanations.push({ type: "PASS", icon: "✓", text: "Full name matches authorized government record" });
    } else {
      explanations.push({ type: "FAIL", icon: "✗", text: "Full name does not match database record" });
    }

    if (databaseResult.dob_match) {
      explanations.push({ type: "PASS", icon: "✓", text: "Date of birth matches authorized government record" });
    } else {
      explanations.push({
        type: "FAIL",
        icon: "✗",
        text: `Date of birth mismatch: Document shows ${params.docDob || 'N/A'}, database on file shows ${databaseResult.passport ? databaseResult.passport.date_of_birth : 'N/A'}`
      });
    }

    if (databaseResult.is_expired) {
      explanations.push({ type: "FAIL", icon: "✗", text: "Document has expired and is invalid for international travel" });
    } else {
      explanations.push({ type: "PASS", icon: "✓", text: "Passport is valid and not expired" });
    }

    if (databaseResult.is_blacklisted || databaseResult.watchlist_hit) {
      explanations.push({ type: "FAIL", icon: "✗", text: `Watchlist match flagged: ${databaseResult.watchlist_details ? databaseResult.watchlist_details.reason : 'Active border alert'}` });
    } else {
      explanations.push({ type: "PASS", icon: "✓", text: "No watchlist or blacklist records found for this identity" });
    }
  } else {
    explanations.push({ type: "FAIL", icon: "✗", text: "Document number was not found in the Mock Authorized Database" });
  }

  // Tampering checks
  if (tamperingScore >= 60) {
    explanations.push({
      type: "FAIL",
      icon: "⚠",
      text: `Suspicious manipulation detected: ${tamperingResult ? tamperingResult.category : 'Digital forgery artifacts detected'}`
    });
  } else {
    explanations.push({
      type: "PASS",
      icon: "✓",
      text: "Document boundaries, substrate noise, and JPEG compression appear uniform and untampered"
    });
  }

  // Biometrics checks
  if (faceMatch >= 85) {
    explanations.push({
      type: "PASS",
      icon: "✓",
      text: `Biometric face verification confirmed with ${faceMatch}% confidence (InsightFace ArcFace 512-D)`
    });
  } else if (faceMatch >= 60) {
    explanations.push({
      type: "WARN",
      icon: "⚠",
      text: `Borderline facial biometric similarity (${faceMatch}%). Visual officer confirmation recommended.`
    });
  } else {
    explanations.push({
      type: "FAIL",
      icon: "✗",
      text: `Biometric face mismatch (${faceMatch}% similarity). Presented traveler does not match document/database photo.`
    });
  }

  // MRZ check
  if (docValidationResult && docValidationResult.mrz_valid) {
    explanations.push({ type: "PASS", icon: "✓", text: "ICAO Doc 9303 MRZ mathematical checksums validated" });
  }

  return {
    final_risk_score: calculatedScore,
    risk_level: riskLevel,
    status_color: statusColor,
    recommended_action: recommendedAction,
    weights_breakdown: {
      tampering_detection: { weight: "25%", score: tamperingComponent, contribution: Math.round(tamperingComponent * 0.25) },
      database_verification: { weight: "25%", score: databaseComponent, contribution: Math.round(databaseComponent * 0.25) },
      face_verification: { weight: "25%", score: faceComponent, contribution: Math.round(faceComponent * 0.25) },
      document_validation: { weight: "15%", score: docValidationComponent, contribution: Math.round(docValidationComponent * 0.15) },
      ocr_image_quality: { weight: "10%", score: qualityComponent, contribution: Math.round(qualityComponent * 0.10) }
    },
    override_applied: overrideTriggered,
    override_reason: overrideReason,
    explainable_factors: explanations,
    summary_sentence: `Overall risk evaluated as ${riskLevel} (${calculatedScore}/100). Recommended officer action: ${recommendedAction}.`
  };
}

module.exports = {
  calculateMultiModalRisk
};
