/**
 * Python AI Microservice Bridge
 * Spawns the Python 3.11 Computer Vision & Deep Learning pipeline (OpenCV, ELA, Face Embeddings, OCR)
 * and exchanges data via secure temporary JSON payload buffers.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configured Python 3.11 executable path
const PYTHON_PATH = process.env.PYTHON_PATH || 'C:\\Users\\sarit\\AppData\\Local\\Programs\\Python\\Python311\\python.exe';
const PIPELINE_SCRIPT = path.resolve(__dirname, '../../ai_engine/pipeline.py');

/**
 * Executes the Python AI screening pipeline asynchronously.
 * @param {Object} options
 * @param {string} options.document_image Base64 or image path of the document
 * @param {string} options.live_face_image Base64 or image path of traveler face
 * @param {string} options.db_photo Base64 or image path of authorized DB photo
 * @param {string} options.demo_case_id Optional preset hint (e.g. CASE_1)
 * @param {Object} options.fallback_data Optional fallback OCR fields
 * @returns {Promise<Object>} The parsed AI pipeline result
 */
function runAiPipeline(options = {}) {
  return new Promise((resolve, reject) => {
    const tempFileName = `sih_ai_${Date.now()}_${Math.floor(Math.random() * 10000)}.json`;
    const tempFilePath = path.join(os.tmpdir(), tempFileName);

    try {
      // Write payload to temp JSON file to safely handle large base64 image strings
      fs.writeFileSync(tempFilePath, JSON.stringify({
        document_image: options.document_image || '',
        live_face_image: options.live_face_image || '',
        db_photo: options.db_photo || '',
        demo_case_id: options.demo_case_id || '',
        fallback_data: options.fallback_data || null,
        tampering_preset: options.tampering_preset || ''
      }), 'utf8');
    } catch (err) {
      return reject(new Error(`Failed to write temp AI payload: ${err.message}`));
    }

    const pythonExecutable = fs.existsSync(PYTHON_PATH) ? PYTHON_PATH : 'python';
    const child = spawn(pythonExecutable, [PIPELINE_SCRIPT, '--json_file', tempFilePath], {
      windowsHide: true
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    // 12-second execution safety timeout
    const timeout = setTimeout(() => {
      child.kill();
      cleanupTemp();
      reject(new Error('Python AI pipeline execution timed out after 12 seconds.'));
    }, 12000);

    function cleanupTemp() {
      try {
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
      } catch (e) {
        // ignore cleanup error
      }
    }

    child.on('close', (code) => {
      clearTimeout(timeout);
      cleanupTemp();

      if (code !== 0) {
        console.error('Python AI process exited with code:', code, 'stderr:', stderr);
        return reject(new Error(`Python AI process failed (code ${code}): ${stderr.slice(0, 200)}`));
      }

      // Extract JSON payload from stdout
      const startMarker = '__JSON_START__';
      const endMarker = '__JSON_END__';
      const startIndex = stdout.indexOf(startMarker);
      const endIndex = stdout.indexOf(endMarker);

      if (startIndex === -1 || endIndex === -1) {
        console.error('Raw Python output missing JSON markers:', stdout.slice(0, 300));
        return reject(new Error('Invalid output format from Python AI pipeline'));
      }

      try {
        const jsonStr = stdout.substring(startIndex + startMarker.length, endIndex);
        const parsed = JSON.parse(jsonStr);
        resolve(parsed);
      } catch (parseErr) {
        reject(new Error(`Failed to parse AI output JSON: ${parseErr.message}`));
      }
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      cleanupTemp();
      reject(new Error(`Failed to spawn Python process: ${err.message}`));
    });
  });
}

module.exports = {
  runAiPipeline
};
