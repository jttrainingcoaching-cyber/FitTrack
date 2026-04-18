const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  res.json(db.prepare('SELECT * FROM body_stats WHERE user_id = ? ORDER BY date ASC').all(req.userId));
});

router.post('/', (req, res) => {
  const { date, weight_lbs, body_fat_pct, waist_in, chest_in, arms_in, hips_in, notes } = req.body;
  const entryDate = date || new Date().toISOString().split('T')[0];
  const result = db.prepare(`
    INSERT INTO body_stats (user_id, date, weight_lbs, body_fat_pct, waist_in, chest_in, arms_in, hips_in, notes)
    VALUES (?,?,?,?,?,?,?,?,?)
  `).run(req.userId, entryDate, weight_lbs || null, body_fat_pct || null, waist_in || null, chest_in || null, arms_in || null, hips_in || null, notes || null);
  res.status(201).json({ id: result.lastInsertRowid, user_id: req.userId, date: entryDate, weight_lbs, body_fat_pct, waist_in, chest_in, arms_in, hips_in, notes });
});

router.delete('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM body_stats WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!row) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM body_stats WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
