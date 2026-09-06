/**
 * Persistent Mock Database & Blockchain-Style Tamper-Evident Audit Ledger Manager
 * SIH Prototype
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  SEED_PERSONS,
  SEED_PASSPORTS,
  SEED_VISAS,
  SEED_WATCHLIST,
  SEED_IDENTITY_DOCUMENTS
} = require('./seedData');

const DB_FILE = path.join(__dirname, 'mock_database.json');

class DatabaseManager {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!fs.existsSync(DB_FILE)) {
      const initialData = {
        persons: SEED_PERSONS,
        passports: SEED_PASSPORTS,
        visas: SEED_VISAS,
        watchlist: SEED_WATCHLIST,
        identity_documents: SEED_IDENTITY_DOCUMENTS,
        screening_history: this.getInitialScreeningHistory(),
        audit_logs: []
      };
      // Build initial audit logs for the initial screenings
      initialData.audit_logs = this.buildInitialAuditLogs(initialData.screening_history);
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
      console.log('Mock Authorized Database initialized and seeded successfully.');
    }
  }

  read() {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.error('Error reading database file, reinitializing...', e);
      this.initDatabase();
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  }

  write(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  }

  // Initial historical screening cases
  getInitialScreeningHistory() {
    return [
      {
        case_id: "CASE-2026-00101",
        timestamp: "2026-09-02T09:14:22Z",
        person_name: "Aarav Mehta",
        document_type: "Passport",
        document_number: "P1234567",
        risk_score: 12,
        risk_level: "LOW RISK",
        face_match_score: 94.0,
        tampering_score: 5,
        database_status: "MATCH",
        decision: "PASS",
        officer_id: "OFFICER-742",
        officer_remarks: "Biometrics and database records authentic. Cleared for entry."
      },
      {
        case_id: "CASE-2026-00102",
        timestamp: "2026-09-02T11:45:10Z",
        person_name: "Priya Sharma",
        document_type: "Passport",
        document_number: "P2345678",
        risk_score: 65,
        risk_level: "MEDIUM RISK",
        face_match_score: 91.0,
        tampering_score: 75,
        database_status: "DOB_MISMATCH",
        decision: "REVIEW",
        officer_id: "OFFICER-819",
        officer_remarks: "DOB mismatch flagged. Referred to secondary immigration counter."
      },
      {
        case_id: "CASE-2026-00103",
        timestamp: "2026-09-03T14:20:00Z",
        person_name: "Carlos Mendez",
        document_type: "Passport",
        document_number: "P4567890",
        risk_score: 58,
        risk_level: "MEDIUM RISK",
        face_match_score: 93.0,
        tampering_score: 5,
        database_status: "EXPIRED",
        decision: "REVIEW",
        officer_id: "OFFICER-742",
        officer_remarks: "Passport expired in 2023. Traveler redirected to embassy renewal desk."
      },
      {
        case_id: "CASE-2026-00104",
        timestamp: "2026-09-03T16:05:44Z",
        person_name: "Viktor Petrov",
        document_type: "Passport",
        document_number: "P9876543",
        risk_score: 98,
        risk_level: "HIGH RISK",
        face_match_score: 91.0,
        tampering_score: 8,
        database_status: "BLACKLISTED",
        decision: "FAIL",
        officer_id: "OFFICER-901",
        officer_remarks: "INTERPOL RED NOTICE hit. Immediate detention protocol initiated."
      },
      {
        case_id: "CASE-2026-00105",
        timestamp: "2026-09-04T10:30:12Z",
        person_name: "David Jonathan Vance",
        document_type: "Passport",
        document_number: "U4982173",
        risk_score: 15,
        risk_level: "LOW RISK",
        face_match_score: 95.5,
        tampering_score: 4,
        database_status: "MATCH",
        decision: "PASS",
        officer_id: "OFFICER-742",
        officer_remarks: "Valid US travel document. Cleared."
      }
    ];
  }

  buildInitialAuditLogs(history) {
    const logs = [];
    let prevHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < history.length; i++) {
      const h = history[i];
      const auditId = `AUDIT-BLK-${1001 + i}`;
      const payload = `${auditId}|${h.case_id}|${h.timestamp}|${h.officer_id}|${h.document_number}|${h.risk_score}|${h.decision}|${h.officer_remarks}|${prevHash}`;
      const currHash = crypto.createHash('sha256').update(payload).digest('hex');

      logs.push({
        audit_id: auditId,
        case_id: h.case_id,
        timestamp: h.timestamp,
        officer_id: h.officer_id,
        document_number: h.document_number,
        risk_score: h.risk_score,
        risk_level: h.risk_level,
        decision: h.decision,
        remarks: h.officer_remarks,
        previous_record_hash: prevHash,
        current_record_hash: currHash
      });

      prevHash = currHash;
    }
    return logs;
  }

  // Blockchain-Style SHA-256 Tamper-Evident Logger
  createAuditRecord(screeningRecord) {
    const data = this.read();
    const lastBlock = data.audit_logs.length > 0
      ? data.audit_logs[data.audit_logs.length - 1]
      : null;

    const prevHash = lastBlock
      ? lastBlock.current_record_hash
      : "0000000000000000000000000000000000000000000000000000000000000000";

    const auditId = `AUDIT-BLK-${1001 + data.audit_logs.length}`;
    const timestamp = screeningRecord.timestamp || new Date().toISOString();
    const payload = `${auditId}|${screeningRecord.case_id}|${timestamp}|${screeningRecord.officer_id}|${screeningRecord.document_number}|${screeningRecord.risk_score}|${screeningRecord.decision}|${screeningRecord.officer_remarks || ''}|${prevHash}`;
    const currentHash = crypto.createHash('sha256').update(payload).digest('hex');

    const newAuditRecord = {
      audit_id: auditId,
      case_id: screeningRecord.case_id,
      timestamp,
      officer_id: screeningRecord.officer_id || "OFFICER-742",
      document_number: screeningRecord.document_number,
      risk_score: screeningRecord.risk_score,
      risk_level: screeningRecord.risk_level,
      decision: screeningRecord.decision,
      remarks: screeningRecord.officer_remarks || "Automated screening evaluation completed.",
      previous_record_hash: prevHash,
      current_record_hash: currentHash
    };

    data.audit_logs.push(newAuditRecord);
    this.write(data);
    return newAuditRecord;
  }

  // Cryptographic Ledger Verification
  verifyAuditChain() {
    const data = this.read();
    const logs = data.audit_logs || [];
    let isValid = true;
    let compromisedIndex = -1;
    let expectedHash = "0000000000000000000000000000000000000000000000000000000000000000";

    for (let i = 0; i < logs.length; i++) {
      const block = logs[i];
      if (block.previous_record_hash !== expectedHash) {
        isValid = false;
        compromisedIndex = i;
        break;
      }
      const payload = `${block.audit_id}|${block.case_id}|${block.timestamp}|${block.officer_id}|${block.document_number}|${block.risk_score}|${block.decision}|${block.remarks || ''}|${block.previous_record_hash}`;
      const recomputed = crypto.createHash('sha256').update(payload).digest('hex');
      if (recomputed !== block.current_record_hash) {
        isValid = false;
        compromisedIndex = i;
        break;
      }
      expectedHash = block.current_record_hash;
    }

    return {
      chain_valid: isValid,
      total_blocks: logs.length,
      compromised_block_index: compromisedIndex,
      status_message: isValid
        ? "Ledger integrity verified: All SHA-256 cryptographic chain hashes match perfectly."
        : `Cryptographic tamper detected at block index ${compromisedIndex}! Record hash was modified.`
    };
  }

  // Screening History CRUD
  addScreeningRecord(record) {
    const data = this.read();
    if (!record.case_id) {
      const seq = 100 + data.screening_history.length + 1;
      record.case_id = `CASE-2026-00${seq}`;
    }
    if (!record.timestamp) {
      record.timestamp = new Date().toISOString();
    }
    data.screening_history.unshift(record);
    this.write(data);
    // Chain into audit log automatically
    const auditRecord = this.createAuditRecord(record);
    return { record, auditRecord };
  }

  getScreeningHistory(filter = 'ALL', search = '') {
    const data = this.read();
    let history = data.screening_history || [];

    if (filter && filter !== 'ALL') {
      history = history.filter(h => {
        if (filter === 'VERIFIED') return h.decision === 'PASS';
        if (filter === 'REVIEW') return h.decision === 'REVIEW';
        if (filter === 'FAILED') return h.decision === 'FAIL';
        if (filter === 'HIGH_RISK') return h.risk_level === 'HIGH RISK' || h.risk_score >= 60;
        return true;
      });
    }

    if (search) {
      const s = search.toLowerCase();
      history = history.filter(h =>
        (h.case_id && h.case_id.toLowerCase().includes(s)) ||
        (h.person_name && h.person_name.toLowerCase().includes(s)) ||
        (h.document_number && h.document_number.toLowerCase().includes(s))
      );
    }
    return history;
  }

  getScreeningById(caseId) {
    const data = this.read();
    return data.screening_history.find(h => h.case_id === caseId) || null;
  }

  // Mock Authorized Database Queries
  getPersons(search = '') {
    const data = this.read();
    if (!search) return data.persons;
    const s = search.toLowerCase();
    return data.persons.filter(p =>
      p.full_name.toLowerCase().includes(s) ||
      p.person_id.toLowerCase().includes(s) ||
      p.nationality.toLowerCase().includes(s)
    );
  }

  getPassports(search = '') {
    const data = this.read();
    if (!search) return data.passports;
    const s = search.toLowerCase();
    return data.passports.filter(p =>
      p.passport_number.toLowerCase().includes(s) ||
      p.full_name.toLowerCase().includes(s) ||
      p.nationality.toLowerCase().includes(s)
    );
  }

  getVisas(search = '') {
    const data = this.read();
    if (!search) return data.visas;
    const s = search.toLowerCase();
    return data.visas.filter(v =>
      v.visa_number.toLowerCase().includes(s) ||
      v.passport_number.toLowerCase().includes(s)
    );
  }

  getWatchlist(search = '') {
    const data = this.read();
    if (!search) return data.watchlist;
    const s = search.toLowerCase();
    return data.watchlist.filter(w =>
      w.full_name.toLowerCase().includes(s) ||
      w.passport_number.toLowerCase().includes(s) ||
      w.reason.toLowerCase().includes(s)
    );
  }

  getIdentityDocuments(search = '') {
    const data = this.read();
    if (!search) return data.identity_documents;
    const s = search.toLowerCase();
    return data.identity_documents.filter(id =>
      id.document_number.toLowerCase().includes(s) ||
      id.document_type.toLowerCase().includes(s)
    );
  }

  // Authorized Database Cross-Check
  queryDatabaseForDocument(passportNumber, name, dob) {
    const data = this.read();
    const passport = data.passports.find(p => p.passport_number.toUpperCase() === passportNumber.toUpperCase());
    const watchlistEntry = data.watchlist.find(w => w.passport_number.toUpperCase() === passportNumber.toUpperCase());
    const visas = data.visas.filter(v => v.passport_number.toUpperCase() === passportNumber.toUpperCase());

    if (!passport) {
      return {
        found: false,
        status: "RECORD_NOT_FOUND",
        message: "No document matching this passport number found in authorized mock database.",
        passport: null,
        watchlist_hit: false,
        visas: []
      };
    }

    const person = data.persons.find(p => p.person_id === passport.person_id) || null;

    // Helper for robust date normalization (handles DD/MM/YYYY and YYYY-MM-DD)
    const normDate = (d) => {
      if (!d) return '';
      const parts = String(d).trim().split(/[\/\-\.]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          return `${parts[0]}${parts[1].padStart(2, '0')}${parts[2].padStart(2, '0')}`;
        } else if (parts[2].length === 4) {
          return `${parts[2]}${parts[1].padStart(2, '0')}${parts[0].padStart(2, '0')}`;
        }
      }
      return String(d).replace(/\D/g, '');
    };

    // Field match checks
    const pNameNorm = passport.full_name.toLowerCase().replace(/[^a-z]/g, '');
    const inNameNorm = (name || '').toLowerCase().replace(/[^a-z]/g, '');
    const nameMatch = name ? (pNameNorm === inNameNorm || pNameNorm.includes(inNameNorm) || inNameNorm.includes(pNameNorm)) : true;

    const dobMatch = dob ? normDate(passport.date_of_birth) === normDate(dob) : true;
    const isExpired = passport.status === "EXPIRED";
    const isRevoked = passport.status === "REVOKED";
    const isBlacklisted = passport.status === "BLACKLISTED" || !!watchlistEntry;

    return {
      found: true,
      status: isBlacklisted ? "BLACKLISTED" : isRevoked ? "REVOKED" : isExpired ? "EXPIRED" : (!dobMatch || !nameMatch) ? "PARTIAL_MATCH" : "VERIFIED_MATCH",
      passport,
      person,
      name_match: nameMatch,
      dob_match: dobMatch,
      is_expired: isExpired,
      is_revoked: isRevoked,
      is_blacklisted: isBlacklisted,
      watchlist_hit: !!watchlistEntry,
      watchlist_details: watchlistEntry || null,
      visas
    };
  }

  // Dashboard Summary Aggregates
  getDashboardStats() {
    const data = this.read();
    const history = data.screening_history || [];

    const total = history.length;
    const verified = history.filter(h => h.decision === 'PASS').length;
    const review = history.filter(h => h.decision === 'REVIEW').length;
    const failed = history.filter(h => h.decision === 'FAIL').length;
    const highRisk = history.filter(h => h.risk_level === 'HIGH RISK' || h.risk_score >= 60).length;
    const tampering = history.filter(h => h.tampering_score >= 50).length;
    const faceMismatch = history.filter(h => h.face_match_score < 60).length;
    const expired = history.filter(h => h.database_status && h.database_status.includes('EXPIRED')).length;
    const blacklisted = history.filter(h => h.database_status && h.database_status.includes('BLACKLISTED')).length;

    return {
      total_screened: total,
      verified,
      review_required: review,
      failed,
      high_risk_documents: highRisk,
      tampering_detected: tampering,
      face_mismatches: faceMismatch,
      expired_documents: expired,
      blacklisted_documents: blacklisted,
      recent_screenings: history.slice(0, 8)
    };
  }

  // Reset database back to default initial seed data
  resetDatabase() {
    if (fs.existsSync(DB_FILE)) {
      fs.unlinkSync(DB_FILE);
    }
    this.initDatabase();
    return { success: true, message: "Database reset to initial SIH seed data." };
  }
}

module.exports = new DatabaseManager();
