const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  res.json(db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? ORDER BY date ASC'
  ).all(req.userId));
});

router.post('/', (req, res) => {
  const { weight, date } = req.body;
  if (!weight) return res.status(400).json({ error: 'weight required' });
  const entryDate = date || new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO body_weight (user_id, weight, date) VALUES (?, ?, ?)'
  ).run(req.userId, weight, entryDate);
  res.status(201).json({ id: result.lastInsertRowid, user_id: req.userId, weight, date: entryDate });
});

router.delete('/:id', (req, res) => {
  const entry = db.prepare('SELECT * FROM body_weight WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!entry) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM body_weight WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
