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
  const { height_in, date_of_birth, gender, unit_system, fitness_goal, activity_level } = req.body;
  const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare(`
      UPDATE user_profiles SET height_in=?, date_of_birth=?, gender=?, unit_system=?, fitness_goal=?, activity_level=?
      WHERE user_id=?
    `).run(height_in, date_of_birth, gender, unit_system, fitness_goal, activity_level, req.userId);
  } else {
    db.prepare(`
      INSERT INTO user_profiles (user_id, height_in, date_of_birth, gender, unit_system, fitness_goal, activity_level)
      VALUES (?,?,?,?,?,?,?)
    `).run(req.userId, height_in, date_of_birth, gender, unit_system || 'imperial', fitness_goal || 'maintain', activity_level || 'moderate');
  }
  res.json({ success: true });
});

module.exports = router;
