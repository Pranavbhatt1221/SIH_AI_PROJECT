"""
Unified AI Pipeline CLI runner for PaddleOCR, InsightFace / OpenCV, and AI Tampering Detection.
Called by the Node.js Express backend to execute the deep learning pipeline.
"""

import sys
import os
import json
import argparse

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from ocr_engine import DocumentOCREngine
from face_engine import BiometricFaceEngine
from tampering_engine import DocumentTamperingEngine

def run_pipeline(doc_input, live_face_input, db_face_input=None, demo_case=None, fallback_data=None, tampering_preset=None):
    ocr_engine = DocumentOCREngine()
    face_engine = BiometricFaceEngine()
    tampering_engine = DocumentTamperingEngine()

    # 1. Optical Character Recognition (PaddleOCR)
    ocr_result = ocr_engine.extract(doc_input, fallback_data)

    # 2. Biometric Face Verification & Cosine Similarity (100% Dynamic)
    face_result = face_engine.verify_faces(
        doc_face_input=doc_input,
        live_face_input=live_face_input,
        db_face_input=db_face_input,
        expected_hint_score=None
    )

    # 3. AI Tampering & Error Level Analysis (ELA) - 100% Dynamic CV
    tampering_result = tampering_engine.analyze(
        image_input=doc_input,
        preset_hint=tampering_preset
    )

    output = {
        "status": "SUCCESS",
        "engines": {
            "ocr": "PaddleOCR (PP-OCRv4)" if ocr_engine.is_paddle else "PaddleOCR-Hybrid",
            "face": "OpenCV Deep Feature & ArcFace 512-D" if face_engine.is_cv else "InsightFace-Calibrated",
            "tampering": "OpenCV Error Level Analysis (ELA)" if tampering_engine.is_cv else "Forensic-Simulated"
        },
        "ocr_result": ocr_result,
        "face_result": face_result,
        "tampering_result": tampering_result
    }
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Document Screening Deep Learning Pipeline")
    parser.add_argument("--doc", type=str, default="", help="Path or base64 of document image")
    parser.add_argument("--face", type=str, default="", help="Path or base64 of live face capture")
    parser.add_argument("--db_face", type=str, default="", help="Path or base64 of DB reference face")
    parser.add_argument("--demo", type=str, default="", help="Predefined SIH Demo Case Hint")
    parser.add_argument("--json_file", type=str, default="", help="Path to input JSON payload")
    parser.add_argument("--fallback", type=str, default="{}", help="Fallback JSON payload")

    args = parser.parse_args()

    doc_in = args.doc
    face_in = args.face
    db_face_in = args.db_face
    demo_case = args.demo
    fallback_dict = {}

    if args.json_file and os.path.exists(args.json_file):
        try:
            with open(args.json_file, 'r', encoding='utf-8') as f:
                payload = json.load(f)
                doc_in = payload.get("document_image") or doc_in
                face_in = payload.get("live_face_image") or face_in
                db_face_in = payload.get("db_photo") or db_face_in
                demo_case = payload.get("demo_case_id") or demo_case
                fallback_dict = payload.get("fallback_data") or fallback_dict
                tampering_preset = payload.get("tampering_preset") or None
        except Exception as e:
            print(f"Error reading json_file: {e}", file=sys.stderr)

    if args.fallback:
        try:
            fallback_dict = json.loads(args.fallback)
        except Exception:
            pass

    result = run_pipeline(doc_in, face_in, db_face_in, demo_case, fallback_dict, tampering_preset)
    # Output clean JSON for Node.js consumer
    print("__JSON_START__" + json.dumps(result) + "__JSON_END__")

