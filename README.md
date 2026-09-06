# AI-Based Fake Identity & Document Screening System
### Smart India Hackathon (SIH) Prototype • Automated Border Checkpoint Screening

> **DISCLAIMER:**  
> **Prototype system for research and demonstration purposes. Government database integration, biometric verification and production-grade document authentication require authorized infrastructure, security controls and regulatory approval.**  
> *DO NOT claim or imply that this system is connected to real government databases, immigration registers, or live sovereign biometric infrastructure. All identities, passport numbers, and records used in this prototype are completely fictional.*

---

## 1. Project Overview & Problem Statement

Border checkpoints process millions of travelers every year under extreme operational pressure. Border security and immigration officers must rapidly inspect identity credentials (passports, visas, national IDs, driving licences) to identify fraudulent documents, spliced photographs, altered biographical text, forged stamps, imposter travelers, and watchlisted persons.

Manual inspection has critical vulnerabilities:
1. **High-Precision Image Manipulation**: High-resolution printers, photo editing software, and digital splicing make physical document tampering difficult to detect with the naked eye.
2. **Impersonation & Lookalikes**: Fraudsters often travel on stolen or borrowed legitimate passports that visually resemble them.
3. **Database Inconsistencies**: Spliced dates of birth or altered expiration dates can evade visual checks unless cross-referenced algorithmically against central civil registries and ICAO checksums.
4. **Audit Trail Vulnerabilities**: Traditional logs can be edited or deleted without cryptographic proof of tampering.

The **AI-Based Fake Identity & Document Screening System** solves these challenges by combining:
- **Optical Character Recognition (OCR) & ICAO Doc 9303 MRZ Validation**: Powered by **PaddleOCR (PP-OCRv4)**.
- **AI Tampering Forensics**: Error Level Analysis (ELA) and edge/noise disparity detection.
- **Biometric Face Verification & Anti-Spoofing Liveness**: Powered by **InsightFace (ArcFace 512-D normalized embeddings)**.
- **Mock Authorized Verification Database**: Fictional persistent civil and immigration registry.
- **Multi-Modal Risk Engine**: Weighted risk calculation with safety overrides and explainable reasoning.
- **Blockchain-Style Tamper-Evident Audit Trail**: Chained SHA-256 blocks with mathematical integrity verification.

---

## 2. System Architecture

```
                                  [ CAPTURE LAYER ]
                             Document Scan & Webcam Face
                                         │
                                         ▼
                     [ IMAGE QUALITY ASSESSMENT (IQA) ]
                         Resolution • Blur • Contrast
                                         │
                                         ▼
                 ┌───────────────────────────────────────────────┐
                 │        PARALLEL AI PROCESSING PIPELINE        │
                 ├───────────────────────┬───────────────────────┤
                 │ PaddleOCR & MRZ       │ AI Tampering (ELA)    │
                 │ PP-OCRv4 Text Extract │ JPEG Recompression    │
                 │ ICAO 9303 Check Digits│ Edge Discontinuity    │
                 ├───────────────────────┼───────────────────────┤
                 │ InsightFace (ArcFace) │ Mock Authorized DB    │
                 │ 512-D Cosine Sim      │ Civil Record Lookup   │
                 │ Anti-Spoof Liveness   │ Interpol Watchlist    │
                 └───────────────────────┴───────────────────────┘
                                         │
                                         ▼
                         [ MULTI-MODAL RISK ENGINE ]
                 Tampering (25%) + DB (25%) + Face (25%)
                       + Doc Validation (15%) + IQA (10%)
                                         │
                                         ▼
                        [ EXPLAINABLE FORENSIC REPORT ]
                          Clear Positive Checks (✓)
                          Flagged Discrepancies (✗/⚠)
                                         │
                                         ▼
                        [ OFFICER COMMAND DASHBOARD ]
                          Decision: PASS / REVIEW / FAIL
                                         │
                                         ▼
                     [ BLOCKCHAIN-STYLE AUDIT TRAIL ]
                   Tamper-Evident SHA-256 Chained Blocks
```

---

## 3. Core Module Descriptions

### 3.1. Optical Character Recognition (PaddleOCR) & MRZ
- **Engine**: **PaddleOCR (PP-OCRv4)** deep learning text detection (DBNet) and recognition (CRNN/SVTR).
- **ICAO Doc 9303 Parser**: Computes standard $7\text{-}3\text{-}1$ weighting modulus-10 mathematical check digits for:
  - Document Number Check Digit
  - Date of Birth Check Digit
  - Expiry Date Check Digit
  - Composite Check Digit
- **Editable Verification Modal**: Officers can inspect raw OCR readings and verify or correct fields before submission.

### 3.2. AI Tampering Detection & Error Level Analysis (ELA)
- **Error Level Analysis (ELA)**: Digital images saved in JPEG format have uniform compression noise. When an area is digitally manipulated (such as pasting a new photo or altering a number in Photoshop), that region possesses an inconsistent compression history.
  The algorithm re-saves the document at a known quality factor ($Q=90$) and computes:
  $$\text{Error} = |\text{Original} - \text{Recompressed}| \times \text{Scale}$$
  Tampered regions illuminate brightly on the interactive forensic heatmap!
- **Edge & Noise Gradient Discontinuity**: Laplacian and Sobel variance filters detect sharp rectangular splicing boundaries around photos.
- **Calibrated Demo Modes**: Includes `CLEAN` (score 5), `PHOTO_TAMPERED` (score 90), `TEXT_TAMPERED` (score 75), and `STAMP_TAMPERED` (score 82).

### 3.3. InsightFace Biometric Verification & Liveness
- **Engine**: **InsightFace (RetinaFace + ArcFace r100 / buffalo_sc)**.
- **5-Point Landmark Alignment**: Normalizes eye, nose, and mouth contours into canonical facial geometry.
- **512-Dimensional Deep Embeddings**: Compares facial vectors using **Cosine Similarity**:
  $$\cos(\theta) = \frac{\mathbf{u} \cdot \mathbf{v}}{\|\mathbf{u}\| \|\mathbf{v}\|}$$
- **Thresholds**:
  - **85% – 100%**: `MATCH` (Green)
  - **60% – 84%**: `REVIEW` (Orange)
  - **0% – 59%**: `MISMATCH` (Red)
- **3-Way Biometric Inspector**:
  1. *Document Photo* vs *Live Traveler Face* (Detects Impersonation)
  2. *Document Photo* vs *Official Database Reference Photo* (Detects Photo Replacement)
  3. *Live Traveler Face* vs *Official Database Reference Photo*

### 3.4. Mock Authorized Database
- Persistent storage containing 20+ realistic fictional identities, valid/expired/revoked/blacklisted passports, visas, national IDs, and Interpol Watchlist hits.
- Allows live searching, record inspection, adding, editing, deleting, and one-click database reset.

### 3.5. Multi-Modal Risk Engine & Explainability
- **Weighted Formula**:
  $$\text{Score} = (0.25 \times \text{Tampering}) + (0.25 \times \text{Database}) + (0.25 \times \text{Face}) + (0.15 \times \text{DocValidation}) + (0.10 \times \text{Quality})$$
- **Risk Tiers**:
  - `0 – 29`: **LOW RISK** $\rightarrow$ Recommended: **PASS**
  - `30 – 59`: **MEDIUM RISK** $\rightarrow$ Recommended: **REVIEW**
  - `60 – 100`: **HIGH RISK** $\rightarrow$ Recommended: **FAIL / MANUAL INVESTIGATION**
- **Safety Overrides**:
  - Blacklisted / Watchlist Hit $\rightarrow$ Score $\ge 98$ (CRITICAL ALERT)
  - Officially Revoked Document $\rightarrow$ Score $\ge 88$
  - Strong Tampering / Photo Splicing $\rightarrow$ Score $\ge 90$
  - Face Biometric Mismatch ($< 60\%$) $\rightarrow$ Score $\ge 85$
  - Date of Birth Discrepancy $\rightarrow$ Score $\ge 65$
  - Expired Passport $\rightarrow$ Score $\ge 58$

---

## 4. Blockchain-Style Tamper-Evident Audit Trail

Every completed screening creates an immutable cryptographic audit record.
Each block is cryptographically linked to the previous block via SHA-256:

$$\text{current\_record\_hash} = \text{SHA256}(\text{audit\_id} + \text{case\_id} + \text{timestamp} + \text{officer\_id} + \text{doc\_num} + \text{risk\_score} + \text{decision} + \text{remarks} + \text{previous\_record\_hash})$$

The **Verify Ledger Integrity** feature recalculates all block hashes sequentially from genesis to head. If any database entry is tampered with or deleted, the verification engine instantly detects the exact corrupted block index!

---

## 5. Five Pre-Configured SIH Demonstration Cases

For rapid, foolproof 3-minute hackathon presentations:

| Case | Scenario | Document | Face Match | Tampering | Risk Score | Expected Action | Explanation |
|---|---|---|---|---|---|---|---|
| **CASE 1** | Genuine Document | Aarav Mehta (P1234567) | 94% (Match) | Low (5) | **12 / 100** | **PASS** | Valid credentials, clean ELA, database match. |
| **CASE 2** | Altered Date of Birth | Priya Sharma (P2345678) | 91% (Match) | Text (75) | **65 / 100** | **REVIEW** | Doc DOB (2001) differs from authorized record (2002). |
| **CASE 3** | Photo Replacement | Rahul Verma (P3456789) | 34% (Mismatch) | Photo (90) | **91 / 100** | **FAIL** | Spliced photo ROI; traveler face does not match database. |
| **CASE 4** | Expired Document | Carlos Mendez (P4567890) | 93% (Match) | Low (5) | **58 / 100** | **REVIEW** | Authentic biometrics, but document expired in 2023. |
| **CASE 5** | Blacklisted / Interpol | Viktor Petrov (P9876543) | 91% (Match) | Low (8) | **98 / 100** | **FAIL** | Active Interpol Red Notice for document fraud. |

---

## 6. How to Run the Project

### Prerequisites
- **Node.js**: v18+ (tested on Node.js v24)
- **Python**: 3.9+ (optional for native PaddleOCR / InsightFace hardware acceleration)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the System
```bash
# Starts Express backend and serves the application on http://localhost:5000
npm start
```
Or for frontend development mode:
```bash
npm run client  # Runs Vite development server on http://localhost:3000
```

---

## 7. Limitations & Future Scope

### Current Prototype Limitations
- Runs on a persistent **mock** database to prevent unauthorized access to sovereign citizen registers.
- Facial liveness anti-spoofing uses client-side motion and framing analysis rather than hardware 3D structured light or infrared IR sensors.

### Future Scope & Production Roadmap
- Integration with ICAO Public Key Directory (PKD) for electronic e-Passport chip cryptographic validation (BAC / EAC / SAC).
- Integration with national border agency API gateways (e.g. CVIS, APIS, INTERPOL SLTD database).
- Dedicated Edge AI acceleration using Intel OpenVINO / NVIDIA TensorRT for sub-second checkpoint throughput.
#   S I H _ A I _ P R O J E C T 
 
 h
