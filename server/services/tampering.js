/**
 * AI Tampering & Manipulation Detection Service
 * Simulates Error Level Analysis (ELA), edge boundary discontinuity,
 * and noise variance analysis. Generates visual forensic indicators.
 */

function generateElaVisualSvg(presetType) {
  // Generates high-fidelity SVG representation of the ELA compression difference heatmap (Jet Colormap)
  const p = (presetType || 'CLEAN').toUpperCase();
  let anomalyOverlay = '';

  if (p === 'PHOTO_TAMPERED') {
    // Spliced photo area glows brightly with high compression error (red/yellow gradient)
    anomalyOverlay = `
      <!-- Spliced Portrait Photo Discontinuity Seam & High ELA Noise -->
      <rect x="24" y="32" width="76" height="96" fill="#EF4444" opacity="0.8" filter="url(#blur)"/>
      <rect x="22" y="30" width="80" height="100" fill="none" stroke="#F87171" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="62" y="142" font-family="monospace" font-size="8" font-weight="bold" fill="#F87171" text-anchor="middle">SPLICED PHOTO REGION (HIGH ELA)</text>
    `;
  } else if (p === 'TEXT_TAMPERED') {
    // Modified date of birth or name area glows with localized high error
    anomalyOverlay = `
      <!-- Modified Text Overlay Anomaly Zone -->
      <rect x="115" y="75" width="95" height="24" fill="#F59E0B" opacity="0.85" filter="url(#blur)"/>
      <rect x="113" y="73" width="99" height="28" fill="none" stroke="#FBBF24" stroke-width="2" stroke-dasharray="3,2"/>
      <text x="162" y="115" font-family="monospace" font-size="8" font-weight="bold" fill="#FDE047" text-anchor="middle">FONT ALIASING ANOMALY</text>
    `;
  } else if (p === 'STAMP_TAMPERED') {
    // Forged stamp area glows with vector color disparity
    anomalyOverlay = `
      <!-- Forged Vector Stamp Anomaly Zone -->
      <circle cx="210" cy="115" r="30" fill="#EC4899" opacity="0.75" filter="url(#blur)"/>
      <circle cx="210" cy="115" r="32" fill="none" stroke="#F472B6" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="210" y="160" font-family="monospace" font-size="8" font-weight="bold" fill="#F472B6" text-anchor="middle">FORGED STAMP CLONE</text>
    `;
  }

  // Realistic ELA representation:
  // Deep Blue/Indigo background represents baseline uniform compression delta = 0
  // Cyan/Teal lines represent natural high-contrast text lines & passport headers
  // Yellow accents represent security emblem contours
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="230" viewBox="0 0 360 230">
    <defs>
      <linearGradient id="jetSubstrate" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#00072D" />
        <stop offset="50%" stop-color="#001B48" />
        <stop offset="100%" stop-color="#000C36" />
      </linearGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      <pattern id="grain" width="16" height="16" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="0.6" fill="#0077B6" opacity="0.3"/>
        <circle cx="8" cy="10" r="0.5" fill="#00B4D8" opacity="0.25"/>
        <circle cx="14" cy="4" r="0.6" fill="#0077B6" opacity="0.3"/>
        <circle cx="10" cy="14" r="0.5" fill="#03045E" opacity="0.4"/>
      </pattern>
    </defs>
    <!-- Background: Uniform Substrate Baseline (Cool Navy / Indigo) -->
    <rect width="360" height="230" fill="url(#jetSubstrate)" rx="8"/>
    <rect width="360" height="230" fill="url(#grain)" rx="8"/>

    <!-- Document Perimeter Seam (Low Cyan Energy) -->
    <rect x="12" y="12" width="336" height="206" fill="none" stroke="#0077B6" stroke-width="1.2" opacity="0.6" rx="4"/>

    <!-- Passport Header & Emblem High-Frequency Signature (Cyan/Green Energy) -->
    <rect x="25" y="20" width="120" height="4" fill="#00F5D4" opacity="0.75" rx="1"/>
    <circle cx="180" cy="28" r="8" fill="none" stroke="#2EC4B6" stroke-width="1" opacity="0.6"/>
    <rect x="220" y="20" width="115" height="3" fill="#00BBF9" opacity="0.7" rx="1"/>

    <!-- Photo Portrait Outline (Natural ELA Typography Energy: Cyan/Teal) -->
    <rect x="25" y="34" width="74" height="92" fill="#001233" stroke="#00B4D8" stroke-width="1.2" opacity="0.85" rx="2"/>
    <circle cx="62" cy="70" r="20" fill="none" stroke="#00F5D4" stroke-width="1" opacity="0.5"/>
    <path d="M 40 118 C 40 98, 84 98, 84 118" fill="none" stroke="#00F5D4" stroke-width="1" opacity="0.5"/>

    <!-- Biographical Text Field Lines (Cyan/Teal high-frequency print edges) -->
    <g opacity="0.7">
      <line x1="118" y1="40" x2="220" y2="40" stroke="#00F5D4" stroke-width="1.5"/>
      <line x1="118" y1="52" x2="310" y2="52" stroke="#00BBF9" stroke-width="1.2"/>
      <line x1="118" y1="64" x2="280" y2="64" stroke="#00BBF9" stroke-width="1.2"/>
      <line x1="118" y1="76" x2="260" y2="76" stroke="#2EC4B6" stroke-width="1.5"/>
      <line x1="118" y1="88" x2="295" y2="88" stroke="#00BBF9" stroke-width="1.2"/>
      <line x1="118" y1="100" x2="240" y2="100" stroke="#00BBF9" stroke-width="1.2"/>
      <line x1="118" y1="112" x2="270" y2="112" stroke="#2EC4B6" stroke-width="1.2"/>
      <line x1="118" y1="124" x2="230" y2="124" stroke="#00BBF9" stroke-width="1.2"/>
    </g>

    <!-- MRZ Zone Optical Grid (Bottom Lines: Consistent Low/Medium Frequency) -->
    <rect x="20" y="165" width="320" height="38" fill="#000E29" stroke="#0077B6" stroke-width="0.8" opacity="0.9" rx="2"/>
    <line x1="25" y1="176" x2="335" y2="176" stroke="#00F5D4" stroke-width="2" stroke-dasharray="3,1" opacity="0.85"/>
    <line x1="25" y1="190" x2="335" y2="190" stroke="#00F5D4" stroke-width="2" stroke-dasharray="3,1" opacity="0.85"/>

    <!-- Highlighted Tampering Anomaly Zone (If simulated mode selected) -->
    ${anomalyOverlay}

    <!-- ELA Status Banner -->
    <rect x="12" y="210" width="336" height="15" fill="#000720" opacity="0.85"/>
    <text x="20" y="221" font-family="monospace" font-size="9" fill="#38BDF8" font-weight="bold">
      ${p === 'CLEAN' || p === 'AUTO' ? 'ELA FORENSIC SCAN • RESAVED JPEG Q=90 • UNIFORM SUBSTRATE' : `ELA FORENSIC SCAN • DETECTED ANOMALY: ${p}`}
    </text>
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
