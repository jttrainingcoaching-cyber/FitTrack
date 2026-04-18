const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function toCSV(rows, headers) {
  if (!rows || rows.length === 0) return headers.join(',') + '\n';
  const escape = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => escape(row[h])).join(','));
  }
  return lines.join('\n');
}

// GET /api/export/workouts
router.get('/workouts', (req, res) => {
  const workouts = db.prepare(`
    SELECT w.id, w.date, w.type, w.name, w.notes, w.duration_seconds,
           e.name as exercise, e.sets, e.reps, e.weight, e.duration_minutes
    FROM workouts w
    LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ?
    ORDER BY w.date DESC, w.id, e.id
  `).all(req.userId);

  const headers = ['id','date','type','name','notes','duration_seconds','exercise','sets','reps','weight','duration_minutes'];
  const csv = toCSV(workouts, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fittrack-workouts-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// GET /api/export/meals
router.get('/meals', (req, res) => {
  const meals = db.prepare(`
    SELECT id, date, name, calories, protein, carbs, fat, created_at
    FROM meals
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
  `).all(req.userId);

  const headers = ['id','date','name','calories','protein','carbs','fat','created_at'];
  const csv = toCSV(meals, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fittrack-meals-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// GET /api/export/bodyweight
router.get('/bodyweight', (req, res) => {
  const weights = db.prepare(`
    SELECT id, date, weight, created_at
    FROM body_weight
    WHERE user_id = ?
    ORDER BY date ASC
  `).all(req.userId);

  const headers = ['id','date','weight','created_at'];
  const csv = toCSV(weights, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fittrack-bodyweight-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// GET /api/export/bodystats
router.get('/bodystats', (req, res) => {
  const stats = db.prepare(`
    SELECT id, date, weight_lbs, body_fat_pct, waist_in, chest_in, arms_in, hips_in, notes, created_at
    FROM body_stats
    WHERE user_id = ?
    ORDER BY date ASC
  `).all(req.userId);

  const headers = ['id','date','weight_lbs','body_fat_pct','waist_in','chest_in','arms_in','hips_in','notes','created_at'];
  const csv = toCSV(stats, headers);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="fittrack-bodystats-${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(csv);
});

// GET /api/export/all — everything as a JSON bundle
router.get('/all', (req, res) => {
  const workouts = db.prepare(`
    SELECT w.*, json_group_array(json_object(
      'name', e.name, 'sets', e.sets, 'reps', e.reps, 'weight', e.weight
    )) as exercises
    FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ? GROUP BY w.id ORDER BY w.date DESC
  `).all(req.userId).map(w => ({ ...w, exercises: JSON.parse(w.exercises).filter(e => e.name) }));

  const meals = db.prepare(
    'SELECT * FROM meals WHERE user_id = ? ORDER BY date DESC'
  ).all(req.userId);

  const bodyweight = db.prepare(
    'SELECT * FROM body_weight WHERE user_id = ? ORDER BY date ASC'
  ).all(req.userId);

  const bodystats = db.prepare(
    'SELECT * FROM body_stats WHERE user_id = ? ORDER BY date ASC'
  ).all(req.userId);

  const goals = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(req.userId);
  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.userId);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="fittrack-export-${new Date().toISOString().split('T')[0]}.json"`);
  res.json({ exported_at: new Date().toISOString(), workouts, meals, bodyweight, bodystats, goals, profile });
});

module.exports = router;
