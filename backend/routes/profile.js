const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.userId);
  res.json(row || { user_id: req.userId, height_in: null, date_of_birth: null, gender: null, unit_system: 'imperial', fitness_goal: 'maintain', activity_level: 'moderate' });
});

router.put('/', (req, res) => {
  try {
    const { height_in, date_of_birth, gender, unit_system, fitness_goal, activity_level } = req.body;
    // node:sqlite's DatabaseSync throws on undefined bindings — coerce to null
    const h   = height_in   ?? null;
    const dob = date_of_birth ?? null;
    const g   = gender      ?? null;
    const us  = unit_system   || 'imperial';
    const fg  = fitness_goal  || 'maintain';
    const al  = activity_level || 'moderate';
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.userId);
    if (existing) {
      db.prepare(`
        UPDATE user_profiles SET height_in=?, date_of_birth=?, gender=?, unit_system=?, fitness_goal=?, activity_level=?
        WHERE user_id=?
      `).run(h, dob, g, us, fg, al, req.userId);
    } else {
      db.prepare(`
        INSERT INTO user_profiles (user_id, height_in, date_of_birth, gender, unit_system, fitness_goal, activity_level)
        VALUES (?,?,?,?,?,?,?)
      `).run(req.userId, h, dob, g, us, fg, al);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /profile error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
