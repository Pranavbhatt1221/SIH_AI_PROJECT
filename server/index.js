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

// Parse large JSON payloads (for base64 document and camera snapshots)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount API Endpoints
app.use('/api/screening', screeningRoutes);
app.use('/api/database', databaseRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check and system info endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AI-Based Fake Identity & Document Screening System',
    edition: 'SIH Prototype • Demonstration Edition',
    ocr_engine: 'PaddleOCR (PP-OCRv4)',
    face_engine: 'InsightFace (ArcFace 512-D)',
    tampering_engine: 'OpenCV ELA + Noise Disparity',
    audit_engine: 'SHA-256 Cryptographic Chaining',
    database: 'Mock Authorized Verification Database (Persistent)',
    disclaimer: 'DEMO DATA ONLY — NOT CONNECTED TO REAL GOVERNMENT SYSTEMS'
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
      message: 'AI Document Screening System Backend Active. Frontend dev server running at http://localhost:3000',
      api_docs: '/api/health'
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` AI DOCUMENT SCREENING SYSTEM — SIH PROTOTYPE`);
  console.log(` Server active on port: ${PORT}`);
  console.log(` API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
