/**
 * Blockchain-Style Tamper-Evident Audit Log Routes
 * Every screening appends a cryptographically linked SHA-256 block.
 */

const express = require('express');
const router = express.Router();
const db = require('../data/db');

// Get all audit log blocks
router.get('/', (req, res) => {
  const data = db.read();
  res.json({
    success: true,
    total_blocks: (data.audit_logs || []).length,
    audit_logs: data.audit_logs || []
  });
});

// Verify cryptographic SHA-256 chain integrity
router.get('/verify', (req, res) => {
  const verification = db.verifyAuditChain();
  res.json({
    success: true,
    verification
  });
});

module.exports = router;
