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
  try {
    const { calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week } = req.body;
    // Fall back to defaults if any field is missing / undefined
    const cg  = calorie_goal          ?? DEFAULTS.calorie_goal;
    const pg  = protein_goal          ?? DEFAULTS.protein_goal;
    const cbg = carbs_goal            ?? DEFAULTS.carbs_goal;
    const fg  = fat_goal              ?? DEFAULTS.fat_goal;
    const sg  = steps_goal            ?? DEFAULTS.steps_goal;
    const wg  = water_goal_oz         ?? DEFAULTS.water_goal_oz;
    const wdw = workout_days_per_week ?? DEFAULTS.workout_days_per_week;
    const existing = db.prepare('SELECT id FROM user_goals WHERE user_id = ?').get(req.userId);
    if (existing) {
      db.prepare(`
        UPDATE user_goals SET calorie_goal=?, protein_goal=?, carbs_goal=?, fat_goal=?,
          steps_goal=?, water_goal_oz=?, workout_days_per_week=?
        WHERE user_id=?
      `).run(cg, pg, cbg, fg, sg, wg, wdw, req.userId);
    } else {
      db.prepare(`
        INSERT INTO user_goals (user_id, calorie_goal, protein_goal, carbs_goal, fat_goal, steps_goal, water_goal_oz, workout_days_per_week)
        VALUES (?,?,?,?,?,?,?,?)
      `).run(req.userId, cg, pg, cbg, fg, sg, wg, wdw);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('PUT /goals error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
