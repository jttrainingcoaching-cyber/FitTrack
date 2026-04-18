const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

const DEFAULTS = {
  calorie_goal: 2000, protein_goal: 150, carbs_goal: 250,
  fat_goal: 65, steps_goal: 10000, water_goal_oz: 64, workout_days_per_week: 4
};

router.get('/', (req, res) => {
  const row = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(req.userId);
  res.json(row || { ...DEFAULTS, user_id: req.userId });
});

router.put('/', (req, res) => {
  const { calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week } = req.body;
  const existing = db.prepare('SELECT id FROM user_goals WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare(`
      UPDATE user_goals SET calorie_goal=?, protein_goal=?, carbs_goal=?, fat_goal=?,
        steps_goal=?, water_goal_oz=?, workout_days_per_week=?
      WHERE user_id=?
    `).run(calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week, req.userId);
  } else {
    db.prepare(`
      INSERT INTO user_goals (user_id, calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(req.userId, calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week);
  }
  res.json({ success: true });
});

module.exports = router;
