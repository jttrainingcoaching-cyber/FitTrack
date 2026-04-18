const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// GET /api/insights/feel-correlation
// Returns average energy/sleep/soreness by day of week
router.get('/feel-correlation', (req, res) => {
  const rows = db.prepare(`
    SELECT
      strftime('%w', w.date) as day_of_week,
      AVG(wf.energy_level) as avg_energy,
      AVG(wf.sleep_quality) as avg_sleep,
      AVG(wf.soreness_level) as avg_soreness,
      AVG(wf.sleep_hours) as avg_sleep_hours,
      COUNT(*) as session_count
    FROM workouts w
    JOIN workout_feelings wf ON wf.workout_id = w.id
    WHERE w.user_id = ?
    GROUP BY day_of_week
    ORDER BY day_of_week ASC
  `).all(req.userId);

  const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const result = rows.map(r => ({
    day: DAY_NAMES[parseInt(r.day_of_week)],
    dayNum: parseInt(r.day_of_week),
    avg_energy: r.avg_energy ? parseFloat(r.avg_energy.toFixed(1)) : null,
    avg_sleep: r.avg_sleep ? parseFloat(r.avg_sleep.toFixed(1)) : null,
    avg_soreness: r.avg_soreness ? parseFloat(r.avg_soreness.toFixed(1)) : null,
    avg_sleep_hours: r.avg_sleep_hours ? parseFloat(r.avg_sleep_hours.toFixed(1)) : null,
    session_count: r.session_count,
  }));

  res.json(result);
});

module.exports = router;
