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

  // Tampering Categories Breakdown from actual records
  const photoCases = history.filter(h => (h.tampering_category || '').toLowerCase().includes('photo')).length;
  const textCases = history.filter(h => (h.tampering_category || '').toLowerCase().includes('text') || (h.tampering_category || '').toLowerCase().includes('dob')).length;
  const stampCases = history.filter(h => (h.tampering_category || '').toLowerCase().includes('stamp')).length;
  const otherCases = history.filter(h => (h.tampering_score >= 60) && !(h.tampering_category || '').toLowerCase().match(/photo|text|dob|stamp/)).length;

  const tamperingBreakdown = [
    { category: 'Photo Replacement', cases: photoCases, fill: '#EF4444' },
    { category: 'Altered Text / DOB', cases: textCases, fill: '#F59E0B' },
    { category: 'Forged Stamp', cases: stampCases, fill: '#EC4899' },
    ...(otherCases > 0 ? [{ category: 'Substrate Anomaly', cases: otherCases, fill: '#8B5CF6' }] : [])
  ];

  // Biometric Outcomes from actual history
  const biometricOutcomes = [
    { type: 'Biometric Match (>=85%)', count: history.filter(h => h.face_match_score >= 85).length, color: '#10B981' },
    { type: 'Manual Review (60-84%)', count: history.filter(h => h.face_match_score >= 60 && h.face_match_score < 85).length, color: '#F59E0B' },
    { type: 'Face Mismatch (<60%)', count: history.filter(h => h.face_match_score < 60).length, color: '#EF4444' }
  ];

  // Daily Screening Volume from actual timestamps in database
  const daysMap = {};
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    daysMap[dateStr] = { date: dateStr, volume: 0, passed: 0, flagged: 0 };
  }

  history.forEach(item => {
    if (item.timestamp) {
      const itemDate = new Date(item.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (daysMap[itemDate]) {
        daysMap[itemDate].volume += 1;
        if (item.decision === 'PASS' || item.decision === 'VERIFIED') {
          daysMap[itemDate].passed += 1;
        } else {
          daysMap[itemDate].flagged += 1;
        }
      }
    }
  });

  const volumeTrends = Object.values(daysMap);

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
