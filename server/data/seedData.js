/**
 * Fictional Mock Authorized Database Seed Data
 * SIH Prototype - DEMO DATA ONLY
 * All identities, passport numbers, and records are completely fictional.
 */

// Helper to create SVG data URI portraits for realistic presentation
function createPortraitSvg(initials, bgColor, textColor, accessory = 'neutral') {
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

const SEED_PERSONS = [
  {
    person_id: "PERS-1001",
    full_name: "Aarav Mehta",
    date_of_birth: "15/08/2002",
    gender: "M",
    nationality: "IND",
    photo_reference: createPortraitSvg("AM", "#1E3A8A", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-01-10T10:00:00Z"
  },
  {
    person_id: "PERS-1002",
    full_name: "Priya Sharma",
    date_of_birth: "15/08/2002",
    gender: "F",
    nationality: "IND",
    photo_reference: createPortraitSvg("PS", "#7C3AED", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-02-14T11:30:00Z"
  },
  {
    person_id: "PERS-1003",
    full_name: "Rahul Verma",
    date_of_birth: "22/11/1998",
    gender: "M",
    nationality: "IND",
    photo_reference: createPortraitSvg("RV", "#047857", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-03-05T09:15:00Z"
  },
  {
    person_id: "PERS-1004",
    full_name: "Carlos Mendez",
    date_of_birth: "10/04/1985",
    gender: "M",
    nationality: "ESP",
    photo_reference: createPortraitSvg("CM", "#B45309", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-06-20T14:00:00Z"
  },
  {
    person_id: "PERS-1005",
    full_name: "Viktor Petrov",
    date_of_birth: "03/12/1980",
    gender: "M",
    nationality: "RUS",
    photo_reference: createPortraitSvg("VP", "#BE123C", "#FFFFFF"),
    status: "FLAGGED",
    created_at: "2021-08-11T08:00:00Z"
  },
  {
    person_id: "PERS-1006",
    full_name: "Sophia Chen",
    date_of_birth: "29/01/1995",
    gender: "F",
    nationality: "SGP",
    photo_reference: createPortraitSvg("SC", "#0D9488", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-04-12T13:45:00Z"
  },
  {
    person_id: "PERS-1007",
    full_name: "David Jonathan Vance",
    date_of_birth: "18/07/1988",
    gender: "M",
    nationality: "USA",
    photo_reference: createPortraitSvg("DV", "#2563EB", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-11-01T15:20:00Z"
  },
  {
    person_id: "PERS-1008",
    full_name: "Fatima Al-Mansoor",
    date_of_birth: "09/09/1993",
    gender: "F",
    nationality: "ARE",
    photo_reference: createPortraitSvg("FA", "#D97706", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-05-18T10:10:00Z"
  },
  {
    person_id: "PERS-1009",
    full_name: "Marcus Aurelius Weber",
    date_of_birth: "30/03/1979",
    gender: "M",
    nationality: "DEU",
    photo_reference: createPortraitSvg("MW", "#4338CA", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-09-09T09:00:00Z"
  },
  {
    person_id: "PERS-1010",
    full_name: "Ananya Patel",
    date_of_birth: "05/12/2000",
    gender: "F",
    nationality: "IND",
    photo_reference: createPortraitSvg("AP", "#DB2777", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-07-22T16:30:00Z"
  },
  {
    person_id: "PERS-1011",
    full_name: "Alexander Hamilton Scott",
    date_of_birth: "12/02/1982",
    gender: "M",
    nationality: "GBR",
    photo_reference: createPortraitSvg("AS", "#1D4ED8", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-03-15T12:00:00Z"
  },
  {
    person_id: "PERS-1012",
    full_name: "Elena Rostova",
    date_of_birth: "25/06/1991",
    gender: "F",
    nationality: "RUS",
    photo_reference: createPortraitSvg("ER", "#9333EA", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-08-30T14:40:00Z"
  },
  {
    person_id: "PERS-1013",
    full_name: "Tariq Abdul Rahman",
    date_of_birth: "14/10/1987",
    gender: "M",
    nationality: "MYS",
    photo_reference: createPortraitSvg("TR", "#059669", "#FFFFFF"),
    status: "FLAGGED",
    created_at: "2021-12-05T11:15:00Z"
  },
  {
    person_id: "PERS-1014",
    full_name: "Chloe Antoinette Dubois",
    date_of_birth: "04/05/1996",
    gender: "F",
    nationality: "FRA",
    photo_reference: createPortraitSvg("CD", "#E11D48", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-09-12T17:00:00Z"
  },
  {
    person_id: "PERS-1015",
    full_name: "Liam Patrick O'Connor",
    date_of_birth: "19/08/1990",
    gender: "M",
    nationality: "IRL",
    photo_reference: createPortraitSvg("LO", "#15803D", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-10-10T08:30:00Z"
  },
  {
    person_id: "PERS-1016",
    full_name: "Kenji Sato",
    date_of_birth: "11/01/1984",
    gender: "M",
    nationality: "JPN",
    photo_reference: createPortraitSvg("KS", "#4F46E5", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-06-01T10:00:00Z"
  },
  {
    person_id: "PERS-1017",
    full_name: "Gabriela Silva Santos",
    date_of_birth: "27/07/1994",
    gender: "F",
    nationality: "BRA",
    photo_reference: createPortraitSvg("GS", "#CA8A04", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-03-25T14:10:00Z"
  },
  {
    person_id: "PERS-1018",
    full_name: "Kavita Singhania",
    date_of_birth: "08/03/1997",
    gender: "F",
    nationality: "IND",
    photo_reference: createPortraitSvg("KS2", "#C026D3", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2023-10-05T09:40:00Z"
  },
  {
    person_id: "PERS-1019",
    full_name: "Michael Wayne Chang",
    date_of_birth: "16/09/1986",
    gender: "M",
    nationality: "CAN",
    photo_reference: createPortraitSvg("MC", "#EA580C", "#FFFFFF"),
    status: "ACTIVE",
    created_at: "2022-07-14T11:20:00Z"
  },
  {
    person_id: "PERS-1020",
    full_name: "Dmitri Ivanovich Volkov",
    date_of_birth: "02/11/1975",
    gender: "M",
    nationality: "RUS",
    photo_reference: createPortraitSvg("DV2", "#991B1B", "#FFFFFF"),
    status: "FLAGGED",
    created_at: "2020-05-19T13:00:00Z"
  }
];

const SEED_PASSPORTS = [
  {
    passport_id: "PASS-1001",
    person_id: "PERS-1001",
    passport_number: "P1234567",
    full_name: "Aarav Mehta",
    nationality: "IND",
    date_of_birth: "15/08/2002",
    gender: "M",
    issue_date: "15/08/2022",
    expiry_date: "15/08/2032",
    status: "VALID",
    photo_reference: createPortraitSvg("AM", "#1E3A8A", "#FFFFFF")
  },
  {
    passport_id: "PASS-1002",
    person_id: "PERS-1002",
    passport_number: "P2345678",
    full_name: "Priya Sharma",
    nationality: "IND",
    date_of_birth: "15/08/2002", // Authorized record DOB
    gender: "F",
    issue_date: "10/01/2021",
    expiry_date: "09/01/2031",
    status: "VALID",
    photo_reference: createPortraitSvg("PS", "#7C3AED", "#FFFFFF")
  },
  {
    passport_id: "PASS-1003",
    person_id: "PERS-1003",
    passport_number: "P3456789",
    full_name: "Rahul Verma",
    nationality: "IND",
    date_of_birth: "22/11/1998",
    gender: "M",
    issue_date: "12/04/2020",
    expiry_date: "11/04/2030",
    status: "VALID",
    photo_reference: createPortraitSvg("RV", "#047857", "#FFFFFF")
  },
  {
    passport_id: "PASS-1004",
    person_id: "PERS-1004",
    passport_number: "P4567890",
    full_name: "Carlos Mendez",
    nationality: "ESP",
    date_of_birth: "10/04/1985",
    gender: "M",
    issue_date: "01/03/2013",
    expiry_date: "28/02/2023", // EXPIRED
    status: "EXPIRED",
    photo_reference: createPortraitSvg("CM", "#B45309", "#FFFFFF")
  },
  {
    passport_id: "PASS-1005",
    person_id: "PERS-1005",
    passport_number: "P9876543",
    full_name: "Viktor Petrov",
    nationality: "RUS",
    date_of_birth: "03/12/1980",
    gender: "M",
    issue_date: "10/10/2019",
    expiry_date: "09/10/2029",
    status: "BLACKLISTED", // BLACKLISTED
    photo_reference: createPortraitSvg("VP", "#BE123C", "#FFFFFF")
  },
  {
    passport_id: "PASS-1006",
    person_id: "PERS-1006",
    passport_number: "S1098234",
    full_name: "Sophia Chen",
    nationality: "SGP",
    date_of_birth: "29/01/1995",
    gender: "F",
    issue_date: "05/05/2022",
    expiry_date: "04/05/2032",
    status: "VALID",
    photo_reference: createPortraitSvg("SC", "#0D9488", "#FFFFFF")
  },
  {
    passport_id: "PASS-1007",
    person_id: "PERS-1007",
    passport_number: "U4982173",
    full_name: "David Jonathan Vance",
    nationality: "USA",
    date_of_birth: "18/07/1988",
    gender: "M",
    issue_date: "14/06/2019",
    expiry_date: "13/06/2029",
    status: "VALID",
    photo_reference: createPortraitSvg("DV", "#2563EB", "#FFFFFF")
  },
  {
    passport_id: "PASS-1008",
    person_id: "PERS-1008",
    passport_number: "E8172635",
    full_name: "Fatima Al-Mansoor",
    nationality: "ARE",
    date_of_birth: "09/09/1993",
    gender: "F",
    issue_date: "20/11/2021",
    expiry_date: "19/11/2031",
    status: "VALID",
    photo_reference: createPortraitSvg("FA", "#D97706", "#FFFFFF")
  },
  {
    passport_id: "PASS-1009",
    person_id: "PERS-1009",
    passport_number: "D7291834",
    full_name: "Marcus Aurelius Weber",
    nationality: "DEU",
    date_of_birth: "30/03/1979",
    gender: "M",
    issue_date: "11/02/2018",
    expiry_date: "10/02/2028",
    status: "VALID",
    photo_reference: createPortraitSvg("MW", "#4338CA", "#FFFFFF")
  },
  {
    passport_id: "PASS-1010",
    person_id: "PERS-1010",
    passport_number: "P5612349",
    full_name: "Ananya Patel",
    nationality: "IND",
    date_of_birth: "05/12/2000",
    gender: "F",
    issue_date: "18/08/2020",
    expiry_date: "17/08/2030",
    status: "VALID",
    photo_reference: createPortraitSvg("AP", "#DB2777", "#FFFFFF")
  },
  {
    passport_id: "PASS-1011",
    person_id: "PERS-1011",
    passport_number: "G9182374",
    full_name: "Alexander Hamilton Scott",
    nationality: "GBR",
    date_of_birth: "12/02/1982",
    gender: "M",
    issue_date: "05/09/2017",
    expiry_date: "04/09/2027",
    status: "REVOKED", // REVOKED
    photo_reference: createPortraitSvg("AS", "#1D4ED8", "#FFFFFF")
  },
  {
    passport_id: "PASS-1012",
    person_id: "PERS-1012",
    passport_number: "R8271635",
    full_name: "Elena Rostova",
    nationality: "RUS",
    date_of_birth: "25/06/1991",
    gender: "F",
    issue_date: "12/12/2021",
    expiry_date: "11/12/2031",
    status: "VALID",
    photo_reference: createPortraitSvg("ER", "#9333EA", "#FFFFFF")
  },
  {
    passport_id: "PASS-1013",
    person_id: "PERS-1013",
    passport_number: "M5491827",
    full_name: "Tariq Abdul Rahman",
    nationality: "MYS",
    date_of_birth: "14/10/1987",
    gender: "M",
    issue_date: "09/01/2019",
    expiry_date: "08/01/2029",
    status: "LOST", // LOST
    photo_reference: createPortraitSvg("TR", "#059669", "#FFFFFF")
  },
  {
    passport_id: "PASS-1014",
    person_id: "PERS-1014",
    passport_number: "F7382910",
    full_name: "Chloe Antoinette Dubois",
    nationality: "FRA",
    date_of_birth: "04/05/1996",
    gender: "F",
    issue_date: "15/07/2022",
    expiry_date: "14/07/2032",
    status: "VALID",
    photo_reference: createPortraitSvg("CD", "#E11D48", "#FFFFFF")
  },
  {
    passport_id: "PASS-1015",
    person_id: "PERS-1015",
    passport_number: "I4829103",
    full_name: "Liam Patrick O'Connor",
    nationality: "IRL",
    date_of_birth: "19/08/1990",
    gender: "M",
    issue_date: "22/04/2019",
    expiry_date: "21/04/2029",
    status: "STOLEN", // STOLEN
    photo_reference: createPortraitSvg("LO", "#15803D", "#FFFFFF")
  }
];

const SEED_VISAS = [
  {
    visa_id: "VISA-1001",
    passport_number: "P1234567",
    visa_number: "V-IND-99201",
    visa_type: "TOURIST",
    issue_date: "01/01/2024",
    expiry_date: "31/12/2025",
    allowed_stay: "90 DAYS",
    entry_type: "MULTIPLE",
    status: "VALID"
  },
  {
    visa_id: "VISA-1002",
    passport_number: "P2345678",
    visa_number: "V-IND-88192",
    visa_type: "BUSINESS",
    issue_date: "15/02/2024",
    expiry_date: "14/02/2025",
    allowed_stay: "60 DAYS",
    entry_type: "MULTIPLE",
    status: "VALID"
  },
  {
    visa_id: "VISA-1003",
    passport_number: "P4567890",
    visa_number: "V-ESP-77102",
    visa_type: "TRANSIT",
    issue_date: "10/01/2022",
    expiry_date: "20/01/2022",
    allowed_stay: "72 HOURS",
    entry_type: "SINGLE",
    status: "EXPIRED"
  },
  {
    visa_id: "VISA-1004",
    passport_number: "P9876543",
    visa_number: "V-RUS-00192",
    visa_type: "TOURIST",
    issue_date: "11/11/2020",
    expiry_date: "10/11/2021",
    allowed_stay: "30 DAYS",
    entry_type: "SINGLE",
    status: "REVOKED"
  },
  {
    visa_id: "VISA-1005",
    passport_number: "U4982173",
    visa_number: "V-USA-66291",
    visa_type: "EMPLOYMENT",
    issue_date: "01/06/2023",
    expiry_date: "31/05/2026",
    allowed_stay: "365 DAYS",
    entry_type: "MULTIPLE",
    status: "VALID"
  }
];

const SEED_WATCHLIST = [
  {
    watchlist_id: "WATCH-1001",
    person_id: "PERS-1005",
    passport_number: "P9876543",
    full_name: "Viktor Petrov",
    reason: "Interpol Red Notice - Cross-border Financial Fraud & Document Forgery",
    risk_level: "HIGH",
    status: "ACTIVE",
    flag_type: "RED_NOTICE"
  },
  {
    watchlist_id: "WATCH-1002",
    person_id: "PERS-1013",
    passport_number: "M5491827",
    full_name: "Tariq Abdul Rahman",
    reason: "Suspected Identity Trafficking & Lost Document Misuse",
    risk_level: "HIGH",
    status: "ACTIVE",
    flag_type: "IDENTITY_FRAUD"
  },
  {
    watchlist_id: "WATCH-1003",
    person_id: "PERS-1020",
    passport_number: "R9918273",
    full_name: "Dmitri Ivanovich Volkov",
    reason: "Immigration Violation & Visa Overstay History",
    risk_level: "MEDIUM",
    status: "ACTIVE",
    flag_type: "OVERSTAY"
  }
];

const SEED_IDENTITY_DOCUMENTS = [
  {
    document_id: "ID-1001",
    person_id: "PERS-1001",
    document_type: "NATIONAL_ID",
    document_number: "AADHAAR-8912-3456-7890",
    issue_date: "01/01/2018",
    expiry_date: "PERMANENT",
    status: "VALID"
  },
  {
    document_id: "ID-1002",
    person_id: "PERS-1001",
    document_type: "DRIVING_LICENCE",
    document_number: "DL-MH-14-2020008912",
    issue_date: "12/03/2020",
    expiry_date: "11/03/2040",
    status: "VALID"
  },
  {
    document_id: "ID-1003",
    person_id: "PERS-1007",
    document_type: "DRIVING_LICENCE",
    document_number: "DL-NY-982173491",
    issue_date: "10/05/2021",
    expiry_date: "09/05/2029",
    status: "VALID"
  }
];

// 5 Pre-configured SIH Demonstration Cases
const SIH_DEMO_CASES = {
  CASE_1: {
    id: "CASE_1",
    name: "CASE 1 — GENUINE DOCUMENT",
    subtitle: "Aarav Mehta - Clean Passport & Face Match",
    person_name: "Aarav Mehta",
    document_type: "Passport",
    document_number: "P1234567",
    nationality: "IND",
    date_of_birth: "15/08/2002",
    gender: "M",
    issue_date: "15/08/2022",
    expiry_date: "15/08/2032",
    mrz_line1: "P<INDMEHTA<<AARAV<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    mrz_line2: "P1234567<4IND0208154M3208154<<<<<<<<<<<<<<04",
    database_status: "MATCH",
    tampering_preset: "CLEAN",
    tampering_score: 5,
    face_match_score: 94.0,
    face_verification_status: "MATCH",
    liveness_status: "PASS",
    risk_score: 12,
    risk_level: "LOW RISK",
    recommended_decision: "PASS",
    doc_photo: createPortraitSvg("AM", "#1E3A8A", "#FFFFFF"),
    live_face: createPortraitSvg("AM", "#1E3A8A", "#FFFFFF"),
    db_photo: createPortraitSvg("AM", "#1E3A8A", "#FFFFFF"),
    explanation: "Document format is valid, MRZ checksums verified, authorized database record matches all biographical fields, no tampering detected, and live biometric face comparison confirms 94% identity match."
  },
  CASE_2: {
    id: "CASE_2",
    name: "CASE 2 — ALTERED DATE OF BIRTH",
    subtitle: "Priya Sharma - Text Manipulation & Database DOB Mismatch",
    person_name: "Priya Sharma",
    document_type: "Passport",
    document_number: "P2345678",
    nationality: "IND",
    date_of_birth: "15/08/2001", // Modified from authorized 15/08/2002
    database_dob: "15/08/2002",
    gender: "F",
    issue_date: "10/01/2021",
    expiry_date: "09/01/2031",
    mrz_line1: "P<INDSHARMA<<PRIYA<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    mrz_line2: "P2345678<1IND0108153F3101094<<<<<<<<<<<<<<02",
    database_status: "PARTIAL MATCH (DOB Mismatch)",
    tampering_preset: "TEXT_TAMPERED",
    tampering_score: 75,
    face_match_score: 91.0,
    face_verification_status: "MATCH",
    liveness_status: "PASS",
    risk_score: 65,
    risk_level: "MEDIUM RISK",
    recommended_decision: "REVIEW",
    doc_photo: createPortraitSvg("PS", "#7C3AED", "#FFFFFF"),
    live_face: createPortraitSvg("PS", "#7C3AED", "#FFFFFF"),
    db_photo: createPortraitSvg("PS", "#7C3AED", "#FFFFFF"),
    explanation: "Date of birth on document (15/08/2001) does not match official authorized database record (15/08/2002). AI tampering analysis flagged suspicious font smoothing and ink dispersion around DOB text cluster. Officer manual review required."
  },
  CASE_3: {
    id: "CASE_3",
    name: "CASE 3 — PHOTO REPLACEMENT / IMPERSONATION",
    subtitle: "Rahul Verma - Spliced Portrait & Face Biometric Mismatch",
    person_name: "Rahul Verma",
    document_type: "Passport",
    document_number: "P3456789",
    nationality: "IND",
    date_of_birth: "22/11/1998",
    gender: "M",
    issue_date: "12/04/2020",
    expiry_date: "11/04/2030",
    mrz_line1: "P<INDVERMA<<RAHUL<<<<<<<<<<<<<<<<<<<<<<<<<<<",
    mrz_line2: "P3456789<8IND9811225M3004113<<<<<<<<<<<<<<08",
    database_status: "RECORD FOUND",
    tampering_preset: "PHOTO_TAMPERED",
    tampering_score: 90,
    face_match_score: 34.0, // Face mismatch
    face_verification_status: "MISMATCH",
    liveness_status: "PASS",
    risk_score: 91,
    risk_level: "HIGH RISK",
    recommended_decision: "FAIL",
    doc_photo: createPortraitSvg("IMPOSTER", "#B91C1C", "#FFFFFF"), // Spliced imposter photo
    live_face: createPortraitSvg("IMPOSTER", "#B91C1C", "#FFFFFF"), // Traveler presenting imposter face
    db_photo: createPortraitSvg("RV", "#047857", "#FFFFFF"), // Official photo on record
    explanation: "Document biographical details match database, but Error Level Analysis (ELA) detected strong compression boundaries indicating photo replacement. Live presented face does not match official government record on file (34% similarity). Severe impersonation alert."
  },
  CASE_4: {
    id: "CASE_4",
    name: "CASE 4 — EXPIRED DOCUMENT",
    subtitle: "Carlos Mendez - Expired Travel Passport",
    person_name: "Carlos Mendez",
    document_type: "Passport",
    document_number: "P4567890",
    nationality: "ESP",
    date_of_birth: "10/04/1985",
    gender: "M",
    issue_date: "01/03/2013",
    expiry_date: "28/02/2023", // Expired
    mrz_line1: "P<ESPMENDEZ<<CARLOS<<<<<<<<<<<<<<<<<<<<<<<<<",
    mrz_line2: "P4567890<2ESP8504106M2302283<<<<<<<<<<<<<<06",
    database_status: "MATCH (STATUS: EXPIRED)",
    tampering_preset: "CLEAN",
    tampering_score: 5,
    face_match_score: 93.0,
    face_verification_status: "MATCH",
    liveness_status: "PASS",
    risk_score: 58,
    risk_level: "MEDIUM RISK",
    recommended_decision: "REVIEW",
    doc_photo: createPortraitSvg("CM", "#B45309", "#FFFFFF"),
    live_face: createPortraitSvg("CM", "#B45309", "#FFFFFF"),
    db_photo: createPortraitSvg("CM", "#B45309", "#FFFFFF"),
    explanation: "Document identity and biometrics are authentic, but the passport expired on 28/02/2023. Document is invalid for international border crossing under immigration regulations."
  },
  CASE_5: {
    id: "CASE_5",
    name: "CASE 5 — BLACKLISTED DOCUMENT / WATCHLIST HIT",
    subtitle: "Viktor Petrov - Interpol Red Notice Hit",
    person_name: "Viktor Petrov",
    document_type: "Passport",
    document_number: "P9876543",
    nationality: "RUS",
    date_of_birth: "03/12/1980",
    gender: "M",
    issue_date: "10/10/2019",
    expiry_date: "09/10/2029",
    mrz_line1: "P<RUSPETROV<<VIKTOR<<<<<<<<<<<<<<<<<<<<<<<<<",
    mrz_line2: "P9876543<7RUS8012038M2910091<<<<<<<<<<<<<<05",
    database_status: "BLACKLISTED / WATCHLIST HIT",
    tampering_preset: "CLEAN",
    tampering_score: 8,
    face_match_score: 91.0,
    face_verification_status: "MATCH",
    liveness_status: "PASS",
    risk_score: 98,
    risk_level: "HIGH RISK",
    recommended_decision: "FAIL",
    doc_photo: createPortraitSvg("VP", "#BE123C", "#FFFFFF"),
    live_face: createPortraitSvg("VP", "#BE123C", "#FFFFFF"),
    db_photo: createPortraitSvg("VP", "#BE123C", "#FFFFFF"),
    explanation: "CRITICAL ALERT: Document number and identity matched an active INTERPOL RED NOTICE in the Mock Authorized Database (Reason: Cross-border Financial Fraud & Document Forgery). Mandatory denial and border detention protocol required."
  }
};

module.exports = {
  SEED_PERSONS,
  SEED_PASSPORTS,
  SEED_VISAS,
  SEED_WATCHLIST,
  SEED_IDENTITY_DOCUMENTS,
  SIH_DEMO_CASES,
  createPortraitSvg
};
