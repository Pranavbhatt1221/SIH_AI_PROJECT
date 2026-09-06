/**
 * Bulk 100 Passport Generator & Importer for Mock Authorized Database
 * SIH Prototype
 * 
 * Usage:
 *   node scripts/seed_100_passports.js               # Generates 100 realistic passport records
 *   node scripts/seed_100_passports.js --file data.json   # Imports custom JSON file
 *   node scripts/seed_100_passports.js --file data.csv    # Imports custom CSV file
 */

const fs = require('fs');
const path = require('path');

const DB_FILE = path.resolve(__dirname, '../server/data/mock_database.json');

// Helper to create SVG data URI portraits
function createPortraitSvg(initials, bgColor) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="250" viewBox="0 0 200 250">
    <defs>
      <linearGradient id="grad_${initials}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgColor}" stop-opacity="1" />
        <stop offset="100%" stop-color="#0F172A" stop-opacity="1" />
      </linearGradient>
    </defs>
    <rect width="200" height="250" fill="url(#grad_${initials})" rx="8"/>
    <!-- Head & Shoulders silhouette -->
    <circle cx="100" cy="85" r="42" fill="#E2E8F0" opacity="0.9"/>
    <path d="M 40 215 C 40 155, 160 155, 160 215 Z" fill="#CBD5E1" opacity="0.95"/>
    <circle cx="100" cy="80" r="34" fill="#F8FAFC"/>
    <!-- Facial Features / Silhouette -->
    <circle cx="88" cy="76" r="3.5" fill="#334155"/>
    <circle cx="112" cy="76" r="3.5" fill="#334155"/>
    <path d="M 98 84 L 102 84 L 100 92 Z" fill="#64748B"/>
    <path d="M 92 100 Q 100 106 108 100" stroke="#334155" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- Security Watermark / Biometric Overlay -->
    <rect x="10" y="10" width="180" height="230" fill="none" stroke="#00F0FF" stroke-width="1" stroke-dasharray="4,4" opacity="0.4"/>
    <text x="100" y="235" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#00F0FF" text-anchor="middle" letter-spacing="1">REF: ${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const PALETTE = [
  '#1E3A8A', '#047857', '#7C3AED', '#B45309', '#BE123C',
  '#0D9488', '#4338CA', '#D97706', '#0284C7', '#475569',
  '#059669', '#E11D48', '#15803D', '#7E22CE', '#C2410C'
];

const RAW_NAMES = [
  // Indian Identities
  { name: "Rohit Krishnan", nat: "IND", gender: "M", dob: "14/03/1992" },
  { name: "Ananya Deshmukh", nat: "IND", gender: "F", dob: "25/11/1996" },
  { name: "Vikramaditya Rao", nat: "IND", gender: "M", dob: "08/07/1988" },
  { name: "Meera Kulkarni", nat: "IND", gender: "F", dob: "19/02/1995" },
  { name: "Siddharth Banerjee", nat: "IND", gender: "M", dob: "30/09/1990" },
  { name: "Pooja Hegde", nat: "IND", gender: "F", dob: "12/04/1994" },
  { name: "Devendra Patel", nat: "IND", gender: "M", dob: "05/10/1982" },
  { name: "Sunita Reddy", nat: "IND", gender: "F", dob: "17/06/1989" },
  { name: "Arjun Singhania", nat: "IND", gender: "M", dob: "22/12/1997" },
  { name: "Neha Chawla", nat: "IND", gender: "F", dob: "09/01/1993" },
  { name: "Kabir Sengupta", nat: "IND", gender: "M", dob: "18/05/1991" },
  { name: "Rhea Bhattacharya", nat: "IND", gender: "F", dob: "27/08/1998" },
  { name: "Manish Aggarwal", nat: "IND", gender: "M", dob: "11/04/1986" },
  { name: "Kavita Nair", nat: "IND", gender: "F", dob: "03/12/1990" },
  { name: "Abhishek Joshi", nat: "IND", gender: "M", dob: "16/09/1993" },
  { name: "Tanvi Saxena", nat: "IND", gender: "F", dob: "24/07/1995" },
  { name: "Gautam Malhotra", nat: "IND", gender: "M", dob: "02/02/1984" },
  { name: "Aditi Iyer", nat: "IND", gender: "F", dob: "15/10/1997" },
  { name: "Karan Johar", nat: "IND", gender: "M", dob: "28/06/1990" },
  { name: "Bhavna Trivedi", nat: "IND", gender: "F", dob: "13/03/1992" },

  // USA Identities
  { name: "Ethan Walker", nat: "USA", gender: "M", dob: "10/06/1989" },
  { name: "Olivia Taylor", nat: "USA", gender: "F", dob: "21/04/1993" },
  { name: "Mason Campbell", nat: "USA", gender: "M", dob: "14/08/1985" },
  { name: "Ava Richardson", nat: "USA", gender: "F", dob: "09/02/1996" },
  { name: "Lucas Mitchell", nat: "USA", gender: "M", dob: "17/12/1991" },
  { name: "Harper Simmons", nat: "USA", gender: "F", dob: "04/05/1994" },
  { name: "Logan Cooper", nat: "USA", gender: "M", dob: "29/10/1987" },
  { name: "Charlotte Reed", nat: "USA", gender: "F", dob: "18/03/1998" },
  { name: "Jackson Kelly", nat: "USA", gender: "M", dob: "06/07/1992" },
  { name: "Amelia Howard", nat: "USA", gender: "F", dob: "23/09/1995" },

  // United Kingdom Identities
  { name: "Oliver Harrison", nat: "GBR", gender: "M", dob: "12/01/1990" },
  { name: "Emily Watson", nat: "GBR", gender: "F", dob: "15/09/1992" },
  { name: "George Fletcher", nat: "GBR", gender: "M", dob: "28/03/1988" },
  { name: "Isla Gallagher", nat: "GBR", gender: "F", dob: "07/11/1995" },
  { name: "Harry Henderson", nat: "GBR", gender: "M", dob: "19/08/1986" },
  { name: "Grace Cunningham", nat: "GBR", gender: "F", dob: "30/05/1997" },
  { name: "Arthur Bradley", nat: "GBR", gender: "M", dob: "02/10/1991" },
  { name: "Freya Hopkins", nat: "GBR", gender: "F", dob: "16/06/1994" },

  // Germany Identities
  { name: "Felix Schneider", nat: "DEU", gender: "M", dob: "05/04/1987" },
  { name: "Hannah Wagner", nat: "DEU", gender: "F", dob: "22/12/1993" },
  { name: "Lukas Fischer", nat: "DEU", gender: "M", dob: "14/07/1990" },
  { name: "Lea Becker", nat: "DEU", gender: "F", dob: "08/03/1996" },
  { name: "Maximilian Hoffmann", nat: "DEU", gender: "M", dob: "19/10/1985" },
  { name: "Emma Schafer", nat: "DEU", gender: "F", dob: "27/01/1998" },
  { name: "Paul Richter", nat: "DEU", gender: "M", dob: "11/09/1992" },
  { name: "Marie Koch", nat: "DEU", gender: "F", dob: "03/06/1994" },

  // France Identities
  { name: "Antoine Moreau", nat: "FRA", gender: "M", dob: "18/02/1989" },
  { name: "Camille Laurent", nat: "FRA", gender: "F", dob: "09/10/1993" },
  { name: "Julien Simon", nat: "FRA", gender: "M", dob: "24/05/1986" },
  { name: "Manon Michel", nat: "FRA", gender: "F", dob: "12/12/1995" },
  { name: "Louis Garcia", nat: "FRA", gender: "M", dob: "07/08/1991" },
  { name: "Ines David", nat: "FRA", gender: "F", dob: "26/04/1997" },

  // Spain Identities
  { name: "Alejandro Navarro", nat: "ESP", gender: "M", dob: "13/06/1988" },
  { name: "Lucia Romero", nat: "ESP", gender: "F", dob: "29/03/1994" },
  { name: "Mateo Torres", nat: "ESP", gender: "M", dob: "15/11/1990" },
  { name: "Carmen Ruiz", nat: "ESP", gender: "F", dob: "04/09/1992" },
  { name: "Daniel Serrano", nat: "ESP", gender: "M", dob: "20/01/1987" },
  { name: "Paula Molina", nat: "ESP", gender: "F", dob: "10/08/1996" },

  // Japan Identities
  { name: "Kenji Sato", nat: "JPN", gender: "M", dob: "08/05/1990" },
  { name: "Yui Takahashi", nat: "JPN", gender: "F", dob: "17/10/1994" },
  { name: "Daiki Watanabe", nat: "JPN", gender: "M", dob: "23/02/1986" },
  { name: "Aoi Kobayashi", nat: "JPN", gender: "F", dob: "11/12/1993" },
  { name: "Ren Yamamoto", nat: "JPN", gender: "M", dob: "06/07/1991" },
  { name: "Hina Ito", nat: "JPN", gender: "F", dob: "19/04/1997" },

  // Canada Identities
  { name: "Liam Tremblay", nat: "CAN", gender: "M", dob: "14/09/1989" },
  { name: "Chloe Roy", nat: "CAN", gender: "F", dob: "28/01/1995" },
  { name: "Noah Gagnon", nat: "CAN", gender: "M", dob: "03/11/1991" },
  { name: "Zoe Bouchard", nat: "CAN", gender: "F", dob: "21/06/1993" },

  // Australia Identities
  { name: "Jack Morrison", nat: "AUS", gender: "M", dob: "25/08/1987" },
  { name: "Ruby Kelly", nat: "AUS", gender: "F", dob: "10/03/1994" },
  { name: "Henry Sullivan", nat: "AUS", gender: "M", dob: "16/12/1990" },
  { name: "Evie Walsh", nat: "AUS", gender: "F", dob: "02/07/1996" },

  // UAE Identities
  { name: "Zayed Al-Nahyan", nat: "ARE", gender: "M", dob: "12/05/1988" },
  { name: "Mariam Al-Qasimi", nat: "ARE", gender: "F", dob: "27/09/1993" },
  { name: "Rashid Al-Maktoum", nat: "ARE", gender: "M", dob: "04/02/1991" },
  { name: "Noura Al-Falasi", nat: "ARE", gender: "F", dob: "18/11/1995" },

  // Singapore Identities
  { name: "Wei Ming Tan", nat: "SGP", gender: "M", dob: "09/08/1992" },
  { name: "Mei Ling Lim", nat: "SGP", gender: "F", dob: "23/03/1996" },
  { name: "Jun Jie Lee", nat: "SGP", gender: "M", dob: "15/01/1989" },

  // Italy Identities
  { name: "Marco Rossi", nat: "ITA", gender: "M", dob: "20/04/1986" },
  { name: "Giulia Ferrari", nat: "ITA", gender: "F", dob: "07/10/1992" },
  { name: "Alessandro Esposito", nat: "ITA", gender: "M", dob: "13/08/1990" },
  { name: "Sofia Bianchi", nat: "ITA", gender: "F", dob: "29/12/1995" },

  // Brazil Identities
  { name: "Gabriel Souza", nat: "BRA", gender: "M", dob: "11/06/1987" },
  { name: "Isabela Lima", nat: "BRA", gender: "F", dob: "24/02/1994" },
  { name: "Lucas Ferreira", nat: "BRA", gender: "M", dob: "18/10/1991" },

  // Netherlands Identities
  { name: "Daan van Dijk", nat: "NLD", gender: "M", dob: "03/05/1989" },
  { name: "Sanne de Boer", nat: "NLD", gender: "F", dob: "16/11/1993" },

  // Sweden Identities
  { name: "Elias Andersson", nat: "SWE", gender: "M", dob: "28/07/1990" },
  { name: "Astrid Lindgren", nat: "SWE", gender: "F", dob: "12/03/1995" },

  // Greece Identities
  { name: "Nikos Papadopoulos", nat: "GRC", gender: "M", dob: "07/09/1988" },
  { name: "Eleni Georgiou", nat: "GRC", gender: "F", dob: "21/05/1994" },

  // Switzerland Identities
  { name: "Simon Meier", nat: "CHE", gender: "M", dob: "14/01/1987" },
  { name: "Lara Schmidt", nat: "CHE", gender: "F", dob: "30/08/1992" },

  // South Korea Identities
  { name: "Min-jun Kim", nat: "KOR", gender: "M", dob: "05/12/1991" },
  { name: "Seo-yeon Park", nat: "KOR", gender: "F", dob: "18/06/1996" }
];

function generate100Passports() {
  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

  const existingPassportNums = new Set(data.passports.map(p => p.passport_number.toUpperCase()));
  const existingPersonIds = new Set(data.persons.map(p => p.person_id));

  let addedCount = 0;
  const newPersons = [];
  const newPassports = [];

  for (let i = 0; i < 100; i++) {
    const item = RAW_NAMES[i % RAW_NAMES.length];
    const idNum = 2000 + i + 1;
    const personId = `PERS-${idNum}`;
    const passportId = `PASS-${idNum}`;

    let prefix = item.nat === 'IND' ? 'P' : item.nat[0];
    let numDigits = String(7000000 + i * 37 + Math.floor(Math.random() * 999)).slice(0, 7);
    let passportNumber = `${prefix}${numDigits}`;

    if (existingPassportNums.has(passportNumber)) {
      passportNumber = `${prefix}${String(8000000 + i * 43).slice(0, 7)}`;
    }
    existingPassportNums.add(passportNumber);

    const nameParts = item.name.split(' ');
    const initials = (nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : 'X')).toUpperCase();
    const color = PALETTE[i % PALETTE.length];
    const portrait = createPortraitSvg(initials, color);

    const issueYear = 2018 + (i % 6);
    const issueDate = `15/0${(i % 9) + 1}/${issueYear}`;
    const expiryYear = issueYear + 10;
    const expiryDate = `14/0${(i % 9) + 1}/${expiryYear}`;

    let status = "VALID";
    if (i % 10 === 7) status = "EXPIRED";
    if (i % 20 === 13) status = "FLAGGED";

    const personObj = {
      person_id: personId,
      full_name: item.name,
      date_of_birth: item.dob,
      gender: item.gender,
      nationality: item.nat,
      photo_reference: portrait,
      status: status === "FLAGGED" ? "FLAGGED" : "ACTIVE",
      created_at: new Date().toISOString()
    };

    const passportObj = {
      passport_id: passportId,
      person_id: personId,
      passport_number: passportNumber,
      full_name: item.name,
      nationality: item.nat,
      date_of_birth: item.dob,
      gender: item.gender,
      issue_date: issueDate,
      expiry_date: status === "EXPIRED" ? `14/05/2023` : expiryDate,
      status: status,
      photo_reference: portrait
    };

    newPersons.push(personObj);
    newPassports.push(passportObj);
    addedCount++;
  }

  // Prepend new records to database
  data.persons = [...newPersons, ...data.persons];
  data.passports = [...newPassports, ...data.passports];

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');

  console.log(`\n✅ Successfully inserted ${addedCount} passport records into Mock Authorized Database!`);
  console.log(`📁 Database file: ${DB_FILE}`);
  console.log(`📊 Total Passports now in DB: ${data.passports.length}`);
  console.log(`📊 Total Persons now in DB: ${data.persons.length}`);

  return { addedCount, totalPassports: data.passports.length, totalPersons: data.persons.length };
}

function importFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  const content = fs.readFileSync(filePath, 'utf8').trim();
  let records = [];

  if (filePath.endsWith('.json')) {
    records = JSON.parse(content);
    if (!Array.isArray(records)) {
      if (records.passports) records = records.passports;
      else records = [records];
    }
  } else if (filePath.endsWith('.csv')) {
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => row[h] = vals[idx] || '');
      records.push(row);
    }
  }

  let count = 0;
  for (const r of records) {
    const pNum = (r.passport_number || r.document_number || `P${Math.floor(1000000 + Math.random() * 9000000)}`).toUpperCase();
    const name = r.full_name || r.name || 'Traveler Identity';
    const nat = (r.nationality || 'IND').toUpperCase();
    const dob = r.date_of_birth || r.dob || '15/08/1995';
    const gender = (r.gender || 'M').toUpperCase();
    const status = (r.status || 'VALID').toUpperCase();
    const expiry = r.expiry_date || r.expiry || '15/08/2032';
    const photo = r.photo_reference || r.photo || createPortraitSvg(name.slice(0, 2).toUpperCase(), '#1E3A8A');

    const pId = `PASS-CUSTOM-${Date.now()}-${count + 1}`;
    const persId = `PERS-CUSTOM-${Date.now()}-${count + 1}`;

    data.persons.unshift({
      person_id: persId,
      full_name: name,
      date_of_birth: dob,
      gender,
      nationality: nat,
      photo_reference: photo,
      status: status === 'FLAGGED' ? 'FLAGGED' : 'ACTIVE',
      created_at: new Date().toISOString()
    });

    data.passports.unshift({
      passport_id: pId,
      person_id: persId,
      passport_number: pNum,
      full_name: name,
      nationality: nat,
      date_of_birth: dob,
      gender,
      issue_date: '01/01/2022',
      expiry_date: expiry,
      status: status,
      photo_reference: photo
    });
    count++;
  }

  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\n✅ Successfully imported ${count} custom records into Mock Authorized Database!`);
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const fileArgIdx = args.indexOf('--file');
  if (fileArgIdx !== -1 && args[fileArgIdx + 1]) {
    importFromFile(args[fileArgIdx + 1]);
  } else {
    generate100Passports();
  }
}

module.exports = { generate100Passports, importFromFile };
