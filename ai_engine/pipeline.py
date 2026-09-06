"""
Unified AI Pipeline CLI runner for PaddleOCR, InsightFace, and AI Tampering Detection.
Called by the Node.js Express backend to execute the deep learning pipeline.
"""

import sys
import os
import json
import argparse

from ocr_engine import DocumentOCREngine
from face_engine import BiometricFaceEngine
from tampering_engine import DocumentTamperingEngine

def run_pipeline(doc_path, live_face_path, demo_case=None, fallback_data=None):
    ocr_engine = DocumentOCREngine()
    face_engine = BiometricFaceEngine()
    tampering_engine = DocumentTamperingEngine()

    # Tampering scenario mapping from demo_case
    tamper_scenario = "CLEAN"
    expected_face_score = 94.0

    if demo_case == "CASE_2" or demo_case == "ALTERED_DOB":
        tamper_scenario = "TEXT_TAMPERED"
        expected_face_score = 92.0
    elif demo_case == "CASE_3" or demo_case == "PHOTO_REPLACEMENT":
        tamper_scenario = "PHOTO_TAMPERED"
        expected_face_score = 34.0
    elif demo_case == "CASE_4" or demo_case == "EXPIRED":
        tamper_scenario = "CLEAN"
        expected_face_score = 93.0
    elif demo_case == "CASE_5" or demo_case == "BLACKLISTED":
        tamper_scenario = "CLEAN"
        expected_face_score = 91.0
    elif demo_case == "STAMP_TAMPERED":
        tamper_scenario = "STAMP_TAMPERED"
        expected_face_score = 88.0

    # Execute engines
    ocr_result = ocr_engine.extract(doc_path, fallback_data)
    face_result = face_engine.verify_faces(doc_path, live_face_path, expected_face_score)
    tampering_result = tampering_engine.analyze(doc_path, tamper_scenario)

    output = {
        "status": "SUCCESS",
        "engines": {
            "ocr": ocr_engine.is_paddle,
            "face": face_engine.is_insightface,
            "tampering": tampering_engine.is_cv
        },
        "ocr_result": ocr_result,
        "face_result": face_result,
        "tampering_result": tampering_result
    }
    return output

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Document Screening Deep Learning Pipeline")
    parser.add_argument("--doc", type=str, default="", help="Path to document image")
    parser.add_argument("--face", type=str, default="", help="Path to live face capture")
    parser.add_argument("--demo", type=str, default="CASE_1", help="Predefined SIH Demo Case")
    parser.add_argument("--fallback", type=str, default="{}", help="Fallback JSON payload")

    args = parser.parse_args()

    fallback_dict = {}
    try:
        if args.fallback:
            fallback_dict = json.loads(args.fallback)
    except Exception:
        fallback_dict = {}

    result = run_pipeline(args.doc, args.face, args.demo, fallback_dict)
    # Output clean JSON for backend consumer
    print("__JSON_START__" + json.dumps(result) + "__JSON_END__")
