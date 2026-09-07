/**
 * Main Express Application Entrypoint
 * AI-Based Fake Identity & Document Screening System (SIH Prototype)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const screeningRoutes = require('./routes/screening');
const databaseRoutes = require('./routes/database');
const auditRoutes = require('./routes/audit');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend dev server
app.use(cors());

// Process error guards to ensure server resilience
process.on('uncaughtException', (err) => {
  try {
    const fs = require('fs');
    fs.appendFileSync(path.join(__dirname, 'server_crash.log'), `[${new Date().toISOString()}] Uncaught: ${err && err.stack || err}\n`);
  } catch (_) {}
  console.error('[CRITICAL] Uncaught exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  try {
    const fs = require('fs');
    fs.appendFileSync(path.join(__dirname, 'server_crash.log'), `[${new Date().toISOString()}] Unhandled rejection: ${reason && reason.stack || reason}\n`);
  } catch (_) {}
  console.error('[CRITICAL] Unhandled promise rejection:', reason);
});

process.on('exit', (code) => {
  try {
    const fs = require('fs');
    fs.appendFileSync(path.join(__dirname, 'server_crash.log'), `[${new Date().toISOString()}] Process exit with code: ${code}\n`);
  } catch (_) {}
});

process.stdout?.on('error', (err) => {
  if (err.code === 'EPIPE') return;
});
process.stderr?.on('error', (err) => {
  if (err.code === 'EPIPE') return;
});

// Parse large JSON payloads (for base64 document and camera snapshots)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Endpoints
app.use('/api/screening', screeningRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);

// Static serving for authorized database passport photos (Option A)
const dbPhotosDir = path.join(__dirname, 'public/database_photos');
if (!require('fs').existsSync(dbPhotosDir)) {
  require('fs').mkdirSync(dbPhotosDir, { recursive: true });
}
app.use('/database_photos', express.static(dbPhotosDir));

// Health check and system info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Based Fake Identity & Document Screening System',
    edition: 'Production Screening Edition',
    ocr_engine: 'PaddleOCR (PP-OCRv4)',
    face_engine: 'InsightFace (ArcFace 512-D)',
    tampering_engine: 'OpenCV ELA + Noise Disparity',
    audit_engine: 'SHA-256 Cryptographic Chaining',
    database: 'Authorized Verification Database (Persistent)',
    status_indicator: 'AUTHORIZED VERIFICATION REGISTRY ACTIVE'
  });
});

// Serve frontend static assets if built
const clientDistPath = path.join(__dirname, '../dist');
app.use(express.static(clientDistPath));

// Fallback to index.html for client-side routing
app.get('*', (req, res) => {
  const indexPath = path.join(clientDistPath, 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.json({
      message: 'AI Document Screening System Backend Active.',
      api_docs: '/api/health'
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AI DOCUMENT SCREENING SYSTEM`);
  console.log(` Server active on port: ${PORT}`);
  console.log(` API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

server.on('error', (err) => {
  try {
    const fs = require('fs');
    fs.appendFileSync(path.join(__dirname, 'server_crash.log'), `[${new Date().toISOString()}] Server error: ${err && err.stack || err}\n`);
  } catch (_) {}
  console.error('[CRITICAL] Server error:', err);
});
