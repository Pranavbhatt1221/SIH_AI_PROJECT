/**
 * AI Tampering & Manipulation Detection Service
 * Simulates Error Level Analysis (ELA), edge boundary discontinuity,
 * and noise variance analysis. Generates visual forensic indicators.
 */

function generateElaVisualSvg(presetType) {
  // Generates SVG representation of the ELA compression difference heatmap
  let glowBox = '';
  if (presetType === 'PHOTO_TAMPERED') {
    // Spliced photo area glows brightly with high compression error
    glowBox = `
      <rect x="20" y="30" width="70" height="90" fill="#EF4444" opacity="0.65" filter="url(#blur)"/>
      <rect x="18" y="28" width="74" height="94" fill="none" stroke="#EF4444" stroke-width="2" stroke-dasharray="3,3"/>
      <text x="55" y="135" font-family="monospace" font-size="9" font-weight="bold" fill="#F87171" text-anchor="middle">SPLICED PHOTO REGION (HIGH ELA)</text>
    `;
  } else if (presetType === 'TEXT_TAMPERED') {
    // Modified date of birth or name area glows
    glowBox = `
      <rect x="110" y="80" width="80" height="22" fill="#F59E0B" opacity="0.7" filter="url(#blur)"/>
      <rect x="108" y="78" width="84" height="26" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="2,2"/>
      <text x="150" y="115" font-family="monospace" font-size="8" font-weight="bold" fill="#FBBF24" text-anchor="middle">FONT ALIASING ANOMALY</text>
    `;
  } else if (presetType === 'STAMP_TAMPERED') {
    // Forged stamp area glows
    glowBox = `
      <circle cx="150" cy="65" r="28" fill="#EC4899" opacity="0.6" filter="url(#blur)"/>
      <circle cx="150" cy="65" r="30" fill="none" stroke="#EC4899" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="150" y="108" font-family="monospace" font-size="8" font-weight="bold" fill="#F472B6" text-anchor="middle">FORGED STAMP CLONE</text>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
    <defs>
      <filter id="blur">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
    </defs>
    <!-- Dark baseline background representing uniform unmanipulated compression -->
    <rect width="320" height="200" fill="#0A0F1D" rx="6"/>
    <!-- Subtle uniform compression noise grid -->
    <g opacity="0.15">
      ${Array.from({length: 12}).map((_, i) => `<line x1="0" y1="${i * 18}" x2="320" y2="${i * 18}" stroke="#00F0FF" stroke-width="0.5"/>`).join('')}
    </g>
    <!-- Highlighted Tampering Anomaly Zone -->
    ${glowBox}
    <text x="10" y="190" font-family="monospace" font-size="9" fill="#94A3B8">ELA FORENSIC SCAN • RESAVED JPEG Q=90</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function detectTampering(imageMeta, preset = 'CLEAN', liveAiResult = null) {
  // If real AI analysis was computed by pythonBridge / OpenCV ELA
  if (liveAiResult && liveAiResult.tampering_result) {
    const res = liveAiResult.tampering_result;
    return {
      corrupted: !!res.corrupted,
      tampering_score: res.tampering_score,
      risk_level: res.risk_level,
      tampering_detected: res.tampering_detected,
      category: res.category,
      ela_heatmap_url: res.ela_heatmap_url || generateElaVisualSvg(preset),
      anomalies: res.anomalies || [],
      metrics: res.metrics || null,
      explanation: res.explanation || "Computed via live OpenCV Error Level Analysis (ELA) at JPEG Q=90."
    };
  }

  const p = (preset || 'CLEAN').toUpperCase();

  if (p === 'PHOTO_TAMPERED') {
    return {
      tampering_score: 90,
      risk_level: "HIGH",
      tampering_detected: true,
      category: "Photo Replacement / Impersonation",
      ela_heatmap_url: generateElaVisualSvg('PHOTO_TAMPERED'),
      anomalies: [
        { label: "Photo Region Compression (ELA)", status: "FAIL", detail: "Error Level Analysis shows stark compression variance between portrait ROI and passport substrate." },
        { label: "Boundary Splicing Gradient", status: "FAIL", detail: "Sobel/Laplacian filter detected high-frequency rectangular border discontinuity." },
        { label: "Substrate Noise Variance", status: "FAIL", detail: "Color channel noise standard deviation in photo ROI (18.4) diverges from baseline (4.2)." },
        { label: "MRZ Typography & Substrate", status: "PASS", detail: "Machine Readable Zone substrate noise and font geometry appear consistent." }
      ],
      notice: "AI-assisted indication — officer review required. Digital tampering detected in photograph region."
    };
  }

  if (p === 'TEXT_TAMPERED') {
    return {
      tampering_score: 75,
      risk_level: "HIGH",
      tampering_detected: true,
      category: "Text Manipulation / Modified Date of Birth",
      ela_heatmap_url: generateElaVisualSvg('TEXT_TAMPERED'),
      anomalies: [
        { label: "Date of Birth Typography", status: "FAIL", detail: "Font aliasing and anti-aliasing pixel smoothing around DOB digits do not match document font template." },
        { label: "Ink Micro-Dispersion", status: "FAIL", detail: "Pixel gradient dispersion in DOB block indicates synthetic digital text overlay." },
        { label: "Photo Substrate ELA", status: "PASS", detail: "Photograph region exhibits uniform baseline compression levels." },
        { label: "Document Number Font", status: "PASS", detail: "Passport serial number character kerning and ink intensity are within valid tolerances." }
      ],
      notice: "AI-assisted indication — officer review required. Text alteration detected in date of birth block."
    };
  }

  if (p === 'STAMP_TAMPERED') {
    return {
      tampering_score: 82,
      risk_level: "HIGH",
      tampering_detected: true,
      category: "Forged Immigration Stamp",
      ela_heatmap_url: generateElaVisualSvg('STAMP_TAMPERED'),
      anomalies: [
        { label: "Stamp Boundary Discontinuity", status: "FAIL", detail: "Copied/pasted digital boundary detected around immigration entry visa stamp." },
        { label: "RGB Saturation Spectrum", status: "FAIL", detail: "Ink saturation signature indicates digital vector stamp rather than physical pressure ink." },
        { label: "Photo Region", status: "PASS", detail: "Photograph region consistent." },
        { label: "MRZ Validation", status: "PASS", detail: "MRZ structural format is valid." }
      ],
      notice: "AI-assisted indication — officer review required. Digital forgery detected on entry visa stamp."
    };
  }

  // CLEAN / UNTAMPERED
  return {
    tampering_score: 5,
    risk_level: "LOW",
    tampering_detected: false,
    category: "Authentic / Untampered",
    ela_heatmap_url: generateElaVisualSvg('CLEAN'),
    anomalies: [
      { label: "Document Boundaries & Edges", status: "PASS", detail: "Document edges and UV pattern boundaries are continuous and authentic." },
      { label: "Photo Substrate Compression", status: "PASS", detail: "Error Level Analysis shows uniform JPEG compression across entire document surface." },
      { label: "Typography & Ink Structure", status: "PASS", detail: "No pixel smoothing, cloning, or font kerning anomalies detected in text clusters." },
      { label: "MRZ Frequency Analysis", status: "PASS", detail: "OCR machine-readable line noise matches document security paper." }
    ],
    notice: "AI-assisted indication — No tampering detected. Compression, noise, and edge profiles are completely uniform."
  };
}

module.exports = {
  detectTampering,
  generateElaVisualSvg
};
