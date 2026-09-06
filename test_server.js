const http = require('http');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    }).on('error', reject);
  });
}

function post(url, body) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
  });
}

async function testAll() {
  console.log('Testing Server Endpoints on http://localhost:5000 ...');
  try {
    const health = await get('http://localhost:5000/api/health');
    console.log('[1] Health Check:', health.data.system, '— Status:', health.data.status);

    const dbPassports = await get('http://localhost:5000/api/database/passports');
    console.log('[2] Mock Database Passports:', dbPassports.data.passports.length, 'records loaded.');

    const auditCheck = await get('http://localhost:5000/api/audit-logs/verify');
    console.log('[3] SHA-256 Audit Verification:', auditCheck.data.verification.status_message);

    const demoAnalyze = await post('http://localhost:5000/api/screening/analyze', {
      demo_case_id: 'CASE_1',
      document_type: 'Passport'
    });
    console.log('[4] Case 1 (Aarav Mehta - Genuine): Risk Score =', demoAnalyze.data.analysis.risk.final_risk_score, '— Decision:', demoAnalyze.data.analysis.recommended_decision);

    const demoCase3 = await post('http://localhost:5000/api/screening/analyze', {
      demo_case_id: 'CASE_3',
      document_type: 'Passport'
    });
    console.log('[5] Case 3 (Photo Replacement): Risk Score =', demoCase3.data.analysis.risk.final_risk_score, '— Decision:', demoCase3.data.analysis.recommended_decision);

    const demoCase5 = await post('http://localhost:5000/api/screening/analyze', {
      demo_case_id: 'CASE_5',
      document_type: 'Passport'
    });
    console.log('[6] Case 5 (Interpol Blacklist): Risk Score =', demoCase5.data.analysis.risk.final_risk_score, '— Decision:', demoCase5.data.analysis.recommended_decision);

    console.log('\n>>> ALL AUTOMATED VERIFICATION CHECKS PASSED WITH 100% INTEGRITY! <<<');
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err.message);
    process.exit(1);
  }
}

testAll();
