const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const row = db.prepare('SELECT COALESCE(SUM(amount_oz),0) as total FROM water_intake WHERE user_id = ? AND date = ?').get(req.userId, date);
  res.json({ date, total_oz: row.total });
});

router.post('/', (req, res) => {
  const { amount_oz, date } = req.body;
  if (amount_oz == null) return res.status(400).json({ error: 'amount_oz required' });
  const entryDate = date || new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO water_intake (user_id, date, amount_oz) VALUES (?,?,?)').run(req.userId, entryDate, amount_oz);
  const row = db.prepare('SELECT COALESCE(SUM(amount_oz),0) as total FROM water_intake WHERE user_id = ? AND date = ?').get(req.userId, entryDate);
  res.status(201).json({ date: entryDate, total_oz: row.total });
});

// PUT /water — set today's total directly (replaces all entries for the day)
router.put('/', (req, res) => {
  const { amount_oz, date } = req.body;
  if (amount_oz == null) return res.status(400).json({ error: 'amount_oz required' });
  const entryDate = date || new Date().toISOString().split('T')[0];
  const oz = Math.max(0, Number(amount_oz));
  db.prepare('DELETE FROM water_intake WHERE user_id = ? AND date = ?').run(req.userId, entryDate);
  if (oz > 0) {
    db.prepare('INSERT INTO water_intake (user_id, date, amount_oz) VALUES (?,?,?)').run(req.userId, entryDate, oz);
  }
  res.json({ date: entryDate, total_oz: oz });
});

module.exports = router;
