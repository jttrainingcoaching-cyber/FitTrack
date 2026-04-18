const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  res.json(db.prepare(
    'SELECT * FROM meals WHERE user_id = ? AND date = ? ORDER BY created_at ASC'
  ).all(req.userId, date));
});

router.get('/presets', (req, res) => {
  res.json(db.prepare(
    'SELECT * FROM meal_presets WHERE user_id IS NULL OR user_id = ? ORDER BY name ASC'
  ).all(req.userId));
});

router.post('/presets', (req, res) => {
  const { name, calories, protein, carbs, fat } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const result = db.prepare(
    'INSERT INTO meal_presets (user_id, name, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.userId, name, calories || 0, protein || 0, carbs || 0, fat || 0);
  res.status(201).json({ id: result.lastInsertRowid, user_id: req.userId, name, calories, protein, carbs, fat });
});

router.post('/', (req, res) => {
  const { name, date, calories, protein, carbs, fat } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const mealDate = date || new Date().toISOString().split('T')[0];
  const result = db.prepare(
    'INSERT INTO meals (user_id, name, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, name, mealDate, calories || 0, protein || 0, carbs || 0, fat || 0);
  res.status(201).json({
    id: result.lastInsertRowid, user_id: req.userId, name, date: mealDate,
    calories: calories || 0, protein: protein || 0, carbs: carbs || 0, fat: fat || 0
  });
});

router.delete('/:id', (req, res) => {
  const meal = db.prepare('SELECT * FROM meals WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!meal) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM meals WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.get('/summary', (req, res) => {
  const days = parseInt(req.query.days) || 7;
  res.json(db.prepare(`
    SELECT date, SUM(calories) as calories, SUM(protein) as protein,
      SUM(carbs) as carbs, SUM(fat) as fat
    FROM meals
    WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    GROUP BY date ORDER BY date ASC
  `).all(req.userId, days));
});

module.exports = router;
