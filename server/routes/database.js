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

// Reset to Default Seed Data
router.post('/reset', (req, res) => {
  const result = db.resetDatabase();
  res.json(result);
});

module.exports = router;
