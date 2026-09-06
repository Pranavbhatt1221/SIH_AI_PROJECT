const db = require('./server/data/db');
console.log('Database initialized successfully.');
console.log('Persons count:', db.getPersons().length);
console.log('Passports count:', db.getPassports().length);
console.log('Watchlist count:', db.getWatchlist().length);
console.log('Screening history count:', db.getScreeningHistory().length);
const auditVerify = db.verifyAuditChain();
console.log('Audit chain verification:', auditVerify);
process.exit(0);
