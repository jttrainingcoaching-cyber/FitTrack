const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function calcStreak(dates, today) {
  if (!dates.length) return 0;
  let streak = 0;
  let check = today;
  const dateSet = new Set(dates);
  while (dateSet.has(check)) {
    streak++;
    const d = new Date(check + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    check = d.toISOString().split('T')[0];
  }
  return streak;
}

router.get('/', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  const nutrition = db.prepare(`
    SELECT COALESCE(SUM(calories),0) as calories, COALESCE(SUM(protein),0) as protein,
      COALESCE(SUM(carbs),0) as carbs, COALESCE(SUM(fat),0) as fat
    FROM meals WHERE user_id = ? AND date = ?
  `).get(req.userId, today);

  const workouts = db.prepare(`
    SELECT w.id, w.type, w.name, COUNT(e.id) as exercise_count
    FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ? AND w.date = ? GROUP BY w.id
  `).all(req.userId, today);

  const latestWeight = db.prepare(
    'SELECT weight, date FROM body_weight WHERE user_id = ? ORDER BY date DESC LIMIT 1'
  ).get(req.userId);

  const weeklyWorkouts = db.prepare(
    `SELECT COUNT(*) as count FROM workouts WHERE user_id = ? AND date >= date('now', '-7 days')`
  ).get(req.userId);

  const volumeToday = db.prepare(`
    SELECT COALESCE(SUM(e.sets * COALESCE(e.reps,1) * COALESCE(e.weight,0)),0) as volume
    FROM workouts w JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ? AND w.date = ?
  `).get(req.userId, today);

  const goals = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(req.userId) ||
    { calorie_goal: 2000, protein_goal: 150, carbs_goal: 250, fat_goal: 65, steps_goal: 10000, water_goal_oz: 64, workout_days_per_week: 4 };

  // Streaks
  const workoutDates = db.prepare(`SELECT DISTINCT date FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 60`).all(req.userId).map(r => r.date);
  const mealDates = db.prepare(`SELECT DISTINCT date FROM meals WHERE user_id = ? ORDER BY date DESC LIMIT 60`).all(req.userId).map(r => r.date);
  const workoutStreak = calcStreak(workoutDates, today);
  const nutritionStreak = calcStreak(mealDates, today);

  // Water today
  const waterToday = db.prepare(`SELECT COALESCE(SUM(amount_oz),0) as total FROM water_intake WHERE user_id = ? AND date = ?`).get(req.userId, today);

  // ── Recent PRs (last 3 by date) ──────────────────────────────────────────────
  const recentPRs = (() => {
    try {
      return db.prepare(`
        SELECT exercise_name, weight, reps, one_rep_max, date
        FROM personal_records WHERE user_id = ?
        ORDER BY date DESC, one_rep_max DESC LIMIT 3
      `).all(req.userId);
    } catch { return []; }
  })();

  // ── Weekly Summary ────────────────────────────────────────────────────────────
  const weeklyAvgCalories = (() => {
    try {
      const row = db.prepare(`
        SELECT CAST(AVG(daily_cals) AS INTEGER) as avg_calories FROM (
          SELECT date, SUM(calories) as daily_cals
          FROM meals WHERE user_id = ? AND date >= date('now', '-7 days')
          GROUP BY date
        )
      `).get(req.userId);
      return row?.avg_calories ?? 0;
    } catch { return 0; }
  })();

  const weeklyWeightChange = (() => {
    try {
      const rows = db.prepare(`
        SELECT weight FROM body_weight
        WHERE user_id = ? AND date >= date('now', '-7 days')
        ORDER BY date ASC
      `).all(req.userId);
      if (rows.length < 2) return null;
      return parseFloat((rows[rows.length - 1].weight - rows[0].weight).toFixed(1));
    } catch { return null; }
  })();

  res.json({
    today, nutrition, workouts, latestWeight,
    weeklyWorkouts: weeklyWorkouts.count,
    volumeToday: volumeToday.volume,
    goals,
    streaks: { workout: workoutStreak, nutrition: nutritionStreak },
    waterToday: waterToday.total,
    recentPRs,
    weeklySummary: {
      workouts: weeklyWorkouts.count,
      avgCalories: weeklyAvgCalories,
      weightChange: weeklyWeightChange,
    },
  });
});

module.exports = router;
