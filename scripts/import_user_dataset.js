/**
 * Ingest User Passport Dataset (100 Images) into Mock Authorized Database
 * Option A: Copies images to server/public/database_photos/ and references them via static URL.
 */

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:\\Users\\sarit\\Downloads\\passport dataset\\dataset';
const DEST_DIR = path.resolve(__dirname, '../server/public/database_photos');
const DB_FILE = path.resolve(__dirname, '../server/data/mock_database.json');

function runImport() {
  console.log('====================================================');
  console.log(' STARTING BATCH IMPORT: 100 PASSPORT IMAGES');
  console.log(' Source:', SOURCE_DIR);
  console.log(' Destination:', DEST_DIR);
  console.log('====================================================');

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Ensure destination directory exists
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  // Read all files
  const files = fs.readdirSync(SOURCE_DIR)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .sort();

  console.log(`Found ${files.length} passport image files.`);

  // Read current database
  const dbData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

  const newPassports = [];
  const newPersons = [];

  // Common metadata for Azerbaijan MIDV dataset
  // Primary MRZ:
  // PCAZEABDULLAYEV<<DIL<<<<<<<<<<<<<<<<<<<<<<<<<<<<
  // C193895647AZE9408148M28081525188L2V<<<<<<<4
  const baseName = "DIL ABDULLAYEV";
  const baseDob = "14/08/1994";
  const baseExpiry = "15/08/2028";
  const baseIssue = "15/08/2018";
  const baseNat = "AZE";
  const baseGender = "M";
  const primaryDocNumber = "C19389564";

  let imported = 0;

  files.forEach((file, index) => {
    const srcPath = path.join(SOURCE_DIR, file);
    const destPath = path.join(DEST_DIR, file);

    // Copy image file to static serving folder
    fs.copyFileSync(srcPath, destPath);

    const photoRefUrl = `/database_photos/${file}`;
    const seq = String(index).padStart(2, '0');
    
    // Index 0 is the exact primary document number C19389564
    // Subsequent indices have unique sequential passport numbers for table diversity
    let docNumber = index === 0 ? primaryDocNumber : `C193895${String(64 + index).padStart(3, '0')}`;
    
    const passportId = `PASS-AZE-${1000 + index}`;
    const personId = `PERS-AZE-${1000 + index}`;

    const passportRecord = {
      passport_id: passportId,
      person_id: personId,
      passport_number: docNumber,
      full_name: baseName,
      nationality: baseNat,
      date_of_birth: baseDob,
      gender: baseGender,
      issue_date: baseIssue,
      expiry_date: baseExpiry,
      status: "VALID",
      photo_reference: photoRefUrl
    };

    const personRecord = {
      person_id: personId,
      full_name: baseName,
      date_of_birth: baseDob,
      gender: baseGender,
      nationality: baseNat,
      photo_reference: photoRefUrl,
      status: "ACTIVE",
      created_at: new Date().toISOString()
    };

    newPassports.push(passportRecord);
    newPersons.push(personRecord);
    imported++;

    if (imported % 20 === 0 || imported === files.length) {
      console.log(`[${imported}/${files.length}] Processed ${file} -> ${docNumber}`);
    }
  });

  // Ensure C19389564 is at the very top of passports
  // Remove any stale AZE demo records if previously inserted
  dbData.passports = dbData.passports.filter(p => !p.passport_id.startsWith('PASS-AZE-'));
  dbData.persons = dbData.persons.filter(p => !p.person_id.startsWith('PERS-AZE-'));

  // Prepend newly imported 100 records
  dbData.passports = [...newPassports, ...dbData.passports];
  dbData.persons = [...newPersons, ...dbData.persons];

  fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');

  console.log('====================================================');
  console.log(`✅ Successfully imported ${imported} passport images into database!`);
  console.log(`📁 Files copied to: ${DEST_DIR}`);
  console.log(`📄 Database updated: ${DB_FILE}`);
  console.log(`📊 Total Passports now in DB: ${dbData.passports.length}`);
  console.log('====================================================');
}

if (require.main === module) {
  runImport();
}

module.exports = { runImport };
