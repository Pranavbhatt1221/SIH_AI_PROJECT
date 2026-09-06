/**
 * Analytics Summary Routes
 * Aggregates live and historical metrics for Recharts visualizations.
 */

const express = require('express');
const router = express.Router();
const db = require('../data/db');

router.get('/summary', (req, res) => {
  const stats = db.getDashboardStats();
  const data = db.read();
  const history = data.screening_history || [];

  // Risk Distribution data for Donut Chart
  const lowRiskCount = history.filter(h => h.risk_level === 'LOW RISK' || h.risk_score < 30).length;
  const medRiskCount = history.filter(h => h.risk_level === 'MEDIUM RISK' || (h.risk_score >= 30 && h.risk_score < 60)).length;
  const highRiskCount = history.filter(h => h.risk_level === 'HIGH RISK' || h.risk_score >= 60).length;

  const riskDistribution = [
    { name: 'Low Risk', value: lowRiskCount, color: '#10B981' },
    { name: 'Medium Risk', value: medRiskCount, color: '#F59E0B' },
    { name: 'High Risk', value: highRiskCount, color: '#EF4444' }
  ];

  // Decisions Breakdown for Bar Chart
  const screeningResults = [
    { name: 'Verified (PASS)', count: stats.verified, fill: '#10B981' },
    { name: 'Review Required', count: stats.review_required, fill: '#F59E0B' },
    { name: 'Failed / Denied', count: stats.failed, fill: '#EF4444' }
  ];

  // Tampering Categories Breakdown
  const tamperingBreakdown = [
    { category: 'Photo Replacement', cases: Math.max(1, Math.round(stats.tampering_detected * 0.45)), fill: '#EF4444' },
    { category: 'Altered Text / DOB', cases: Math.max(1, Math.round(stats.tampering_detected * 0.35)), fill: '#F59E0B' },
    { category: 'Forged Stamp', cases: Math.max(1, Math.round(stats.tampering_detected * 0.20)), fill: '#EC4899' }
  ];

  // Biometric Outcomes
  const biometricOutcomes = [
    { type: 'Biometric Match (>=85%)', count: history.filter(h => h.face_match_score >= 85).length, color: '#10B981' },
    { type: 'Manual Review (60-84%)', count: history.filter(h => h.face_match_score >= 60 && h.face_match_score < 85).length, color: '#F59E0B' },
    { type: 'Face Mismatch (<60%)', count: history.filter(h => h.face_match_score < 60).length, color: '#EF4444' }
  ];

  // Daily Screening Volume (last 7 simulated days)
  const volumeTrends = [
    { date: 'Aug 29', volume: 42, passed: 36, flagged: 6 },
    { date: 'Aug 30', volume: 55, passed: 48, flagged: 7 },
    { date: 'Aug 31', volume: 68, passed: 59, flagged: 9 },
    { date: 'Sep 01', volume: 84, passed: 72, flagged: 12 },
    { date: 'Sep 02', volume: 76, passed: 64, flagged: 12 },
    { date: 'Sep 03', volume: 92, passed: 80, flagged: 12 },
    { date: 'Sep 04', volume: 105 + history.length, passed: 90 + stats.verified, flagged: 15 + stats.failed }
  ];

  res.json({
    success: true,
    stats,
    charts: {
      risk_distribution: riskDistribution,
      screening_results: screeningResults,
      tampering_breakdown: tamperingBreakdown,
      biometric_outcomes: biometricOutcomes,
      volume_trends: volumeTrends
    }
  });
});

module.exports = router;
