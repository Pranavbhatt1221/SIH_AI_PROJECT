/**
 * Mock Authorized Database Management Routes
 * Provides search, view, add, edit, delete capabilities for fictional records.
 */

const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { createPortraitSvg } = require('../data/seedData');

// Persons
router.get('/persons', (req, res) => {
  const search = req.query.search || '';
  res.json({ success: true, persons: db.getPersons(search) });
});

router.post('/persons', (req, res) => {
  const data = db.read();
  const person = req.body;
  if (!person.person_id) {
    person.person_id = `PERS-${1000 + data.persons.length + 1}`;
  }
  if (!person.photo_reference) {
    const initials = person.full_name ? person.full_name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'XX';
    person.photo_reference = createPortraitSvg(initials, '#3B82F6', '#FFFFFF');
  }
  person.created_at = new Date().toISOString();
  data.persons.unshift(person);
  db.write(data);
  res.json({ success: true, message: "Person added to mock database.", person });
});

// Passports
router.get('/passports', (req, res) => {
  const search = req.query.search || '';
  res.json({ success: true, passports: db.getPassports(search) });
});

router.post('/passports', (req, res) => {
  const data = db.read();
  const passport = req.body;
  if (!passport.passport_id) {
    passport.passport_id = `PASS-${1000 + data.passports.length + 1}`;
  }
  data.passports.unshift(passport);
  db.write(data);
  res.json({ success: true, message: "Passport record added to mock database.", passport });
});

router.put('/passports/:number', (req, res) => {
  const data = db.read();
  const num = req.params.number.toUpperCase();
  const idx = data.passports.findIndex(p => p.passport_number.toUpperCase() === num);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: "Passport not found." });
  }
  data.passports[idx] = { ...data.passports[idx], ...req.body };
  db.write(data);
  res.json({ success: true, message: "Passport record updated.", passport: data.passports[idx] });
});

router.delete('/passports/:number', (req, res) => {
  const data = db.read();
  const num = req.params.number.toUpperCase();
  data.passports = data.passports.filter(p => p.passport_number.toUpperCase() !== num);
  db.write(data);
  res.json({ success: true, message: "Passport record deleted from mock database." });
});

// Visas
router.get('/visas', (req, res) => {
  const search = req.query.search || '';
  res.json({ success: true, visas: db.getVisas(search) });
});

// Watchlist
router.get('/watchlist', (req, res) => {
  const search = req.query.search || '';
  res.json({ success: true, watchlist: db.getWatchlist(search) });
});

// Identity Documents
router.get('/identity-documents', (req, res) => {
  const search = req.query.search || '';
  res.json({ success: true, documents: db.getIdentityDocuments(search) });
});

// Seed 100 Passports
router.post('/seed-100-passports', (req, res) => {
  try {
    const { generate100Passports } = require('../../scripts/seed_100_passports');
    const result = generate100Passports();
    res.json({
      success: true,
      message: `Successfully inserted ${result.addedCount} new passport records into Mock Authorized Database!`,
      stats: result
    });
  } catch (err) {
    console.error('Seed 100 passports error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Bulk Import Passports (JSON array of passport records)
router.post('/bulk-import', (req, res) => {
  try {
    const { passports } = req.body;
    if (!passports || !Array.isArray(passports)) {
      return res.status(400).json({ success: false, message: "Expected 'passports' array in request body." });
    }

    const data = db.read();
    let count = 0;

    for (const r of passports) {
      const pNum = (r.passport_number || `P${Math.floor(1000000 + Math.random() * 9000000)}`).toUpperCase();
      const name = r.full_name || 'Traveler Identity';
      const nat = (r.nationality || 'IND').toUpperCase();
      const dob = r.date_of_birth || '15/08/1995';
      const gender = (r.gender || 'M').toUpperCase();
      const status = (r.status || 'VALID').toUpperCase();
      const expiry = r.expiry_date || '15/08/2032';
      const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const photo = r.photo_reference || createPortraitSvg(initials, '#1E3A8A', '#FFFFFF');

      const pId = `PASS-IMPORT-${Date.now()}-${count + 1}`;
      const persId = `PERS-IMPORT-${Date.now()}-${count + 1}`;

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

    db.write(data);
    res.json({
      success: true,
      message: `Successfully imported ${count} passport records into Mock Authorized Database!`,
      imported_count: count,
      total_passports: data.passports.length
    });
  } catch (err) {
    console.error('Bulk import error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Reset to Default Seed Data
router.post('/reset', (req, res) => {
  const result = db.resetDatabase();
  res.json(result);
});

module.exports = router;
