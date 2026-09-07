"""
Comprehensive Test Suite for AI Image Tampering & Manipulation Forensics (ELA)
Tests:
1. Clean baseline passports:
   - GRC Passport (Red/warm theme, Greek bilingual typography, high contrast)
   - AZE Passport (Green theme, Azerbaijani typography)
2. Simulated tampering on both passports:
   - PHOTO_TAMPERED (spliced face portrait with seam)
   - TEXT_TAMPERED (altered text overlay and noise)
   - STAMP_TAMPERED (altered security stamp)
3. Diverse image types:
   - RGBA PNG image (media_1788726208934.png)
   - Sample database photos
4. Robustness / Edge cases:
   - Non-existent file path
   - Corrupted / invalid base64 string
   - Empty input / None
   - Heatmap validity (base64 data URI format, valid JPEG, matching dimensions)
5. End-to-end AI Pipeline execution (ai_engine/pipeline.py)
"""

import os
import sys
import json
import base64
import io
import cv2
import numpy as np
from PIL import Image

# Ensure ai_engine is importable
ENGINE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai_engine")
sys.path.insert(0, ENGINE_DIR)

from tampering_engine import DocumentTamperingEngine
from pipeline import run_pipeline

GRC_IMG = r"C:/Users/sarit/.gemini/antigravity/brain/5ce04183-b4be-4e89-890a-462dd57df522/.user_uploaded/media_1788683887788.jpg"
AZE_IMG = r"C:/Users/sarit/.gemini/antigravity/brain/5ce04183-b4be-4e89-890a-462dd57df522/.user_uploaded/media_1788683887810.jpg"
PNG_IMG = r"C:/Users/sarit/.gemini/antigravity/brain/5ce04183-b4be-4e89-890a-462dd57df522/.user_uploaded/media_1788726208934.png"

engine = DocumentTamperingEngine()
passed_tests = 0
failed_tests = 0

def log_test(title, passed, details=""):
    global passed_tests, failed_tests
    status = "PASS [OK]" if passed else "FAIL [ERROR]"
    if passed:
        passed_tests += 1
    else:
        failed_tests += 1
    print(f"[{status}] {title}")
    if details:
        print(f"       {details}")

print("=" * 70)
print("1. VERIFYING CLEAN BASELINE PASSPORTS (RED vs GREEN THEMES)")
print("=" * 70)

# GRC Passport (Red theme) - Must NOT be flagged as tampered
res_grc = engine.analyze(GRC_IMG)
m_grc = res_grc["metrics"]
grc_clean = (res_grc["tampering_detected"] is False) and (res_grc["tampering_score"] < 35) and (res_grc["risk_level"] == "LOW")
log_test(
    "GRC Passport (Red theme) - Clean / Untampered Detection",
    grc_clean,
    f"Score: {res_grc['tampering_score']}, Risk: {res_grc['risk_level']}, Tampered: {res_grc['tampering_detected']}, EdgeDensity: {m_grc['edge_density']:.3f}, StdErr: {m_grc['std_error']:.2f}, PatchVar: {m_grc['patch_variance']:.2f}"
)

# AZE Passport (Green theme) - Must NOT be flagged as tampered
res_aze = engine.analyze(AZE_IMG)
m_aze = res_aze["metrics"]
aze_clean = (res_aze["tampering_detected"] is False) and (res_aze["tampering_score"] < 35) and (res_aze["risk_level"] == "LOW")
log_test(
    "AZE Passport (Green theme) - Clean / Untampered Detection",
    aze_clean,
    f"Score: {res_aze['tampering_score']}, Risk: {res_aze['risk_level']}, Tampered: {res_aze['tampering_detected']}, EdgeDensity: {m_aze['edge_density']:.3f}, StdErr: {m_aze['std_error']:.2f}, PatchVar: {m_aze['patch_variance']:.2f}"
)

print("\n" + "=" * 70)
print("2. VERIFYING TAMPERING DETECTION ACCURACY (SIMULATED MODES)")
print("=" * 70)

modes = [
    ("PHOTO_TAMPERED", 60, "Photo Replacement / Splicing"),
    ("TEXT_TAMPERED", 60, "Text Manipulation"),
    ("STAMP_TAMPERED", 35, "Stamp Manipulation")
]

for preset, min_score, desc in modes:
    # Test on GRC (Red theme)
    res = engine.analyze(GRC_IMG, preset_hint=preset)
    ok = res["tampering_score"] >= min_score
    log_test(
        f"GRC Passport - {desc} ({preset})",
        ok,
        f"Score: {res['tampering_score']} (expected >= {min_score}), Detected: {res['tampering_detected']}, Category: {res['category']}"
    )

for preset, min_score, desc in modes:
    # Test on AZE (Green theme)
    res = engine.analyze(AZE_IMG, preset_hint=preset)
    ok = res["tampering_score"] >= min_score
    log_test(
        f"AZE Passport - {desc} ({preset})",
        ok,
        f"Score: {res['tampering_score']} (expected >= {min_score}), Detected: {res['tampering_detected']}, Category: {res['category']}"
    )

print("\n" + "=" * 70)
print("3. VERIFYING HEATMAP GENERATION & ANOMALIES STRUCTURE")
print("=" * 70)

# Check GRC Heatmap
heatmap_url = res_grc.get("ela_heatmap_url", "")
valid_header = heatmap_url.startswith("data:image/jpeg;base64,")
if valid_header:
    b64_content = heatmap_url.split("base64,")[1]
    raw_bytes = base64.b64decode(b64_content)
    nparr = np.frombuffer(raw_bytes, np.uint8)
    decoded_heatmap = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    orig_im = cv2.imread(GRC_IMG)
    dim_match = (decoded_heatmap.shape[:2] == orig_im.shape[:2])
    log_test("GRC ELA Heatmap: Valid JPEG Base64 & Correct Dimensions", dim_match, f"Dimensions: {decoded_heatmap.shape[:2]} == {orig_im.shape[:2]}")
else:
    log_test("GRC ELA Heatmap: Valid JPEG Base64", False, "Missing data URI header")

# Check Anomalies Checklist format
anomalies = res_grc.get("anomalies", [])
valid_anomalies = (
    len(anomalies) == 3 and
    all("label" in a and "status" in a and "detail" in a for a in anomalies) and
    all(a["status"] in ("PASS", "FAIL") for a in anomalies)
)
log_test("Anomalies Forensic Checklist Schema Integrity", valid_anomalies, f"{len(anomalies)} items verified")

# Check all clean anomalies are PASS for GRC
all_pass_grc = all(a["status"] == "PASS" for a in res_grc["anomalies"])
log_test("GRC Clean Checklist All PASS", all_pass_grc, str([f"{a['label']}: {a['status']}" for a in res_grc['anomalies']]))

print("\n" + "=" * 70)
print("4. VERIFYING OTHER IMAGES (RGBA PNG & DATABASE SAMPLES)")
print("=" * 70)

# Test RGBA PNG
if os.path.exists(PNG_IMG):
    res_png = engine.analyze(PNG_IMG)
    log_test("RGBA PNG Image Handled Gracefully", res_png is not None and "tampering_score" in res_png, f"Score: {res_png['tampering_score']}, Risk: {res_png['risk_level']}")

# Test a database sample photo
db_photo_path = r"c:/Users/sarit/Downloads/SIH/SIH/server/public/database_photos/aze_passport_00.jpg"
if os.path.exists(db_photo_path):
    res_db = engine.analyze(db_photo_path)
    log_test("Database Sample Photo (aze_passport_00.jpg)", res_db is not None, f"Score: {res_db['tampering_score']}, Tampered: {res_db['tampering_detected']}")

print("\n" + "=" * 70)
print("5. VERIFYING ERROR HANDLING & RESILIENCE")
print("=" * 70)

# Non-existent file
res_none = engine.analyze("non_existent_file_path_12345.jpg")
log_test("Non-existent File Handled", res_none.get("corrupted") is True, f"Status: {res_none.get('status')}")

# Empty input
res_empty = engine.analyze("")
log_test("Empty Input Handled", res_empty.get("corrupted") is True, f"Status: {res_empty.get('status')}")

# Invalid base64
res_bad_b64 = engine.analyze("data:image/jpeg;base64,INVALID_CORRUPTED_BASE64_%%%")
log_test("Corrupted Base64 Handled", res_bad_b64.get("corrupted") is True, f"Status: {res_bad_b64.get('status')}")

print("\n" + "=" * 70)
print("6. VERIFYING END-TO-END UNIFIED PIPELINE (pipeline.py)")
print("=" * 70)

try:
    pipeline_out = run_pipeline(
        doc_input=GRC_IMG,
        live_face_input=None,
        db_face_input=None,
        demo_case=None,
        tampering_preset=None
    )
    p_status = pipeline_out.get("status") == "SUCCESS"
    p_tamp = pipeline_out.get("tampering_result", {})
    pipeline_clean = p_tamp.get("tampering_detected") is False
    log_test(
        "End-to-End Pipeline Execution with GRC Passport",
        p_status and pipeline_clean,
        f"Pipeline status: {pipeline_out.get('status')}, Tampering Score: {p_tamp.get('tampering_score')}, Detected: {p_tamp.get('tampering_detected')}"
    )
except Exception as e:
    log_test("End-to-End Pipeline Execution with GRC Passport", False, str(e))

print("\n" + "=" * 70)
print(f"TEST RUN COMPLETE: {passed_tests} PASSED, {failed_tests} FAILED out of {passed_tests + failed_tests} tests.")
print("=" * 70)
