const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const templates = db.prepare('SELECT * FROM workout_templates WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  const withExercises = templates.map(t => ({
    ...t,
    exercises: db.prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index ASC').all(t.id)
  }));
  res.json(withExercises);
});

router.post('/', (req, res) => {
  const { name, type, description, exercises } = req.body;
  if (!name || !type) return res.status(400).json({ error: 'name and type required' });

  const transaction = db.transaction(() => {
    const t = db.prepare('INSERT INTO workout_templates (user_id, name, type, description) VALUES (?,?,?,?)').run(req.userId, name, type, description || null);
    const tid = t.lastInsertRowid;
    if (exercises?.length) {
      const ins = db.prepare('INSERT INTO template_exercises (template_id, name, sets, reps, weight, rest_seconds, order_index) VALUES (?,?,?,?,?,?,?)');
      exercises.forEach((ex, i) => ins.run(tid, ex.name, ex.sets || 3, ex.reps || null, ex.weight || null, ex.rest_seconds || 60, i));
    }
    return tid;
  });

  const id = transaction();
  const result = db.prepare('SELECT * FROM workout_templates WHERE id = ?').get(id);
  result.exercises = db.prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index').all(id);
  res.status(201).json(result);
});

router.delete('/:id', (req, res) => {
  const t = db.prepare('SELECT * FROM workout_templates WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM template_exercises WHERE template_id = ?').run(req.params.id);
  db.prepare('DELETE FROM workout_templates WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Create a workout from a template
router.post('/:id/use', (req, res) => {
  const t = db.prepare('SELECT * FROM workout_templates WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!t) return res.status(404).json({ error: 'Not found' });
  const exercises = db.prepare('SELECT * FROM template_exercises WHERE template_id = ? ORDER BY order_index').all(t.id);

  const transaction = db.transaction(() => {
    const w = db.prepare('INSERT INTO workouts (user_id, type, name, date) VALUES (?,?,?,?)').run(req.userId, t.type, t.name, req.body.date || new Date().toISOString().split('T')[0]);
    const wid = w.lastInsertRowid;
    const ins = db.prepare('INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?,?,?,?,?)');
    exercises.forEach(ex => ins.run(wid, ex.name, ex.sets, ex.reps, ex.weight));
    return wid;
  });

  const wid = transaction();
  res.status(201).json({ workout_id: wid, message: 'Workout created from template' });
});

module.exports = router;
