const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ── Personal Records table ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS personal_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER,
    one_rep_max REAL,
    date TEXT NOT NULL,
    workout_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE UNIQUE INDEX IF NOT EXISTS idx_pr_user_exercise
    ON personal_records(user_id, exercise_name);
`);

router.get('/', (req, res) => {
  const workouts = db.prepare(`
    SELECT w.*,
      json_group_array(json_object(
        'id', e.id, 'name', e.name, 'sets', e.sets,
        'reps', e.reps, 'weight', e.weight, 'duration_minutes', e.duration_minutes
      )) as exercises
    FROM workouts w
    LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ?
    GROUP BY w.id
    ORDER BY w.date DESC, w.created_at DESC
  `).all(req.userId);

  res.json(workouts.map(w => ({
    ...w,
    exercises: JSON.parse(w.exercises).filter(e => e.id !== null)
  })));
});

router.get('/volume', (req, res) => {
  const rows = db.prepare(`
    SELECT w.date, SUM(e.sets * COALESCE(e.reps, 1) * COALESCE(e.weight, 0)) as volume
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ?
    GROUP BY w.date
    ORDER BY w.date ASC
    LIMIT 30
  `).all(req.userId);
  res.json(rows);
});

// GET /api/workouts/exercise-progress?name=Bench+Press
router.get('/exercise-progress', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name query param required' });

  const rows = db.prepare(`
    SELECT w.date, MAX(e.weight) as max_weight, MAX(e.reps) as max_reps,
      e.sets, e.name as exercise_name
    FROM workouts w
    JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ? AND e.name LIKE ? AND e.weight > 0
    GROUP BY w.date
    ORDER BY w.date ASC
    LIMIT 50
  `).all(req.userId, `%${name}%`);

  res.json(rows);
});

// GET /api/workouts/substitutes?name=Bench+Press — suggest alternative exercises
router.get('/substitutes', (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'name required' });

  // Comprehensive muscle-group map with substitutes
  const SUBS = {
    // CHEST
    'bench press':            { group: 'Chest', alts: ['Dumbbell Bench Press','Push-ups','Cable Chest Fly','Chest Dip','Floor Press','Incline Dumbbell Press'] },
    'incline bench press':    { group: 'Upper Chest', alts: ['Incline Dumbbell Press','Incline Cable Fly','Landmine Press','High-to-Low Cable Fly'] },
    'incline dumbbell press': { group: 'Upper Chest', alts: ['Incline Barbell Press','Incline Cable Fly','Decline Push-up','Landmine Press'] },
    'chest fly':              { group: 'Chest', alts: ['Cable Chest Fly','Pec Deck','Dumbbell Fly','Push-ups'] },
    'cable chest fly':        { group: 'Chest', alts: ['Dumbbell Fly','Pec Deck','Chest Press Machine','Push-ups'] },
    'chest dip':              { group: 'Chest/Triceps', alts: ['Bench Press','Push-ups','Cable Crossover','Dumbbell Fly'] },

    // BACK
    'deadlift':               { group: 'Back/Hamstrings', alts: ['Trap Bar Deadlift','Romanian Deadlift','Good Mornings','Cable Pull-Through','Rack Pull'] },
    'barbell row':            { group: 'Back', alts: ['Dumbbell Row','Cable Row','T-Bar Row','Chest-Supported Row','Pendlay Row'] },
    'pull-ups':               { group: 'Lats', alts: ['Lat Pulldown','Assisted Pull-up','Band Pull-up','Cable Straight-Arm Pulldown','Negative Pull-ups'] },
    'lat pulldown':           { group: 'Lats', alts: ['Pull-ups','Cable Straight-Arm Pulldown','Dumbbell Pullover','Machine Row'] },
    't-bar row':              { group: 'Back', alts: ['Barbell Row','Chest-Supported Row','Dumbbell Row','Cable Row'] },
    'seated cable row':       { group: 'Back', alts: ['Barbell Row','Dumbbell Row','Machine Row','Face Pulls'] },
    'dumbbell row':           { group: 'Back', alts: ['Barbell Row','Cable Row','T-Bar Row','Chest-Supported Row'] },

    // SHOULDERS
    'overhead press':         { group: 'Shoulders', alts: ['Dumbbell Shoulder Press','Arnold Press','Machine Shoulder Press','Landmine Press','Cable Upright Row'] },
    'lateral raises':         { group: 'Side Delts', alts: ['Cable Lateral Raise','Upright Row','Machine Lateral Raise','Band Lateral Raise'] },
    'front raises':           { group: 'Front Delts', alts: ['Cable Front Raise','Plate Front Raise','Dumbbell Front Raise','Arnold Press'] },
    'face pulls':             { group: 'Rear Delts', alts: ['Reverse Fly','Band Pull-Apart','Rear Delt Machine','Cable Reverse Fly'] },
    'arnold press':           { group: 'Shoulders', alts: ['Overhead Press','Dumbbell Shoulder Press','Machine Shoulder Press'] },

    // LEGS
    'squat':                  { group: 'Quads/Glutes', alts: ['Goblet Squat','Leg Press','Bulgarian Split Squat','Hack Squat','Box Squat','Front Squat'] },
    'leg press':              { group: 'Quads/Glutes', alts: ['Squat','Hack Squat','Bulgarian Split Squat','Walking Lunges','Step-ups'] },
    'romanian deadlift':      { group: 'Hamstrings/Glutes', alts: ['Stiff-Leg Deadlift','Leg Curl','Good Mornings','Hip Thrust','Cable Pull-Through'] },
    'leg curl':               { group: 'Hamstrings', alts: ['Romanian Deadlift','Nordic Curl','Good Mornings','Glute-Ham Raise','Cable Leg Curl'] },
    'leg extension':          { group: 'Quads', alts: ['Terminal Knee Extension','Step-ups','Sissy Squat','Spanish Squat'] },
    'hip thrust':             { group: 'Glutes', alts: ['Glute Bridge','Bulgarian Split Squat','Cable Kickback','Step-ups','Sumo Squat'] },
    'calf raises':            { group: 'Calves', alts: ['Seated Calf Raise','Donkey Calf Raise','Single-Leg Calf Raise','Leg Press Calf Raise'] },
    'walking lunges':         { group: 'Quads/Glutes', alts: ['Reverse Lunge','Bulgarian Split Squat','Step-ups','Leg Press','Goblet Squat'] },
    'bulgarian split squat':  { group: 'Quads/Glutes', alts: ['Walking Lunges','Reverse Lunge','Single-Leg Press','Step-ups'] },

    // TRICEPS
    'tricep pushdown':        { group: 'Triceps', alts: ['Overhead Tricep Extension','Skull Crushers','Tricep Dip','Close-Grip Bench Press','Diamond Push-ups'] },
    'skull crushers':         { group: 'Triceps', alts: ['Tricep Pushdown','Overhead Tricep Extension','Close-Grip Bench Press','Tricep Dip'] },
    'tricep extension':       { group: 'Triceps', alts: ['Tricep Pushdown','Skull Crushers','Overhead Tricep Extension','Diamond Push-ups'] },
    'close-grip bench press': { group: 'Triceps/Chest', alts: ['Skull Crushers','Tricep Dip','Tricep Pushdown','Diamond Push-ups'] },

    // BICEPS
    'barbell curl':           { group: 'Biceps', alts: ['Dumbbell Curl','Hammer Curl','Cable Curl','Preacher Curl','Incline Dumbbell Curl'] },
    'dumbbell curl':          { group: 'Biceps', alts: ['Barbell Curl','Cable Curl','Hammer Curl','Concentration Curl','Preacher Curl'] },
    'hammer curl':            { group: 'Biceps/Brachialis', alts: ['Rope Hammer Curl','Cross-Body Curl','Reverse Curl','Neutral-Grip Pull-up'] },
    'preacher curl':          { group: 'Biceps', alts: ['Barbell Curl','Cable Curl','Spider Curl','Machine Curl'] },

    // CORE
    'plank':                  { group: 'Core', alts: ['Ab Wheel Rollout','Dead Bug','Hollow Body Hold','Pallof Press','Cable Crunch'] },
    'crunch':                 { group: 'Core', alts: ['Cable Crunch','Decline Crunch','Leg Raises','Bicycle Crunch','V-Up'] },

    // CARDIO
    'treadmill intervals':    { group: 'Cardio', alts: ['Cycling Intervals','Rowing Intervals','Jump Rope HIIT','Assault Bike','Stair Climber Intervals'] },
    'elliptical':             { group: 'Cardio', alts: ['Cycling','Rowing Machine','Swimming','Incline Walk','Stair Climber'] },
  };

  const key = name.toLowerCase().trim();

  // Direct match
  if (SUBS[key]) {
    return res.json({ exercise: name, muscleGroup: SUBS[key].group, substitutes: SUBS[key].alts });
  }

  // Fuzzy match — find any key that the name contains or is contained by
  const fuzzyKey = Object.keys(SUBS).find(k => key.includes(k) || k.includes(key));
  if (fuzzyKey) {
    return res.json({ exercise: name, muscleGroup: SUBS[fuzzyKey].group, substitutes: SUBS[fuzzyKey].alts });
  }

  // No match — return generic by keyword detection
  const groups = {
    chest: ['Bench Press','Push-ups','Dumbbell Fly','Cable Chest Fly','Chest Dip'],
    back:  ['Pull-ups','Lat Pulldown','Barbell Row','Seated Cable Row','Dumbbell Row'],
    leg:   ['Squat','Leg Press','Romanian Deadlift','Lunges','Hip Thrust'],
    shoulder: ['Overhead Press','Lateral Raises','Face Pulls','Arnold Press'],
    arm:   ['Barbell Curl','Tricep Pushdown','Hammer Curl','Skull Crushers'],
    core:  ['Plank','Ab Wheel Rollout','Dead Bug','Cable Crunch','Leg Raises'],
  };
  for (const [g, alts] of Object.entries(groups)) {
    if (key.includes(g)) {
      return res.json({ exercise: name, muscleGroup: g, substitutes: alts.filter(a => a.toLowerCase() !== key) });
    }
  }

  res.json({ exercise: name, muscleGroup: 'General', substitutes: ['Try a variation of this exercise','Ask your coach for alternatives'] });
});

// GET /api/workouts/exercise-names — list all unique exercise names for this user
router.get('/exercise-names', (req, res) => {
  const rows = db.prepare(`
    SELECT DISTINCT e.name
    FROM exercises e
    JOIN workouts w ON w.id = e.workout_id
    WHERE w.user_id = ? AND e.weight > 0
    ORDER BY e.name ASC
  `).all(req.userId);
  res.json(rows.map(r => r.name));
});

// GET /api/workouts/plateau-check
router.get('/plateau-check', (req, res) => {
  // Get all exercises with at least 4 sessions of weight data
  const exercises = db.prepare(`
    SELECT DISTINCT e.name
    FROM exercises e
    JOIN workouts w ON w.id = e.workout_id
    WHERE w.user_id = ? AND e.weight > 0
  `).all(req.userId).map(r => r.name);

  const plateaus = [];

  for (const exName of exercises) {
    // Get last 4 sessions with max weight per session
    const sessions = db.prepare(`
      SELECT w.date, MAX(e.weight) as max_weight
      FROM workouts w
      JOIN exercises e ON e.workout_id = w.id
      WHERE w.user_id = ? AND e.name = ? AND e.weight > 0
      GROUP BY w.date
      ORDER BY w.date DESC
      LIMIT 4
    `).all(req.userId, exName);

    if (sessions.length < 4) continue;

    const weights = sessions.map(s => s.max_weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    // If max weight hasn't changed (all weights within 2.5 lbs), flag as plateau
    if (maxWeight - minWeight <= 2.5) {
      plateaus.push({
        exercise: exName,
        weight: maxWeight,
        sessions: sessions.length,
        dates: sessions.map(s => s.date).reverse(),
      });
    }
  }

  res.json(plateaus);
});

// GET /api/workouts/heatmap?weeks=52 — workout counts per day for heatmap
router.get('/heatmap', (req, res) => {
  const weeks = parseInt(req.query.weeks) || 52;
  const days  = weeks * 7;

  const rows = db.prepare(`
    SELECT date, COUNT(*) as count
    FROM workouts
    WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all(req.userId, days);

  // Build a full date map for the range
  const map = {};
  rows.forEach(r => { map[r.date] = r.count; });

  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push({ date: dateStr, count: map[dateStr] || 0 });
  }

  res.json(result);
});

// GET /api/workouts/calorie-summary — calories per day for overlapping charts
router.get('/calorie-summary', (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const rows = db.prepare(`
    SELECT date, SUM(calories) as calories
    FROM meals
    WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
    GROUP BY date
    ORDER BY date ASC
  `).all(req.userId, days);
  res.json(rows);
});

// GET /api/workouts/prs — all personal records for this user
router.get('/prs', (req, res) => {
  const prs = db.prepare(`
    SELECT exercise_name, weight, reps, one_rep_max, date
    FROM personal_records
    WHERE user_id = ?
    ORDER BY one_rep_max DESC
  `).all(req.userId);
  res.json(prs);
});

router.post('/', (req, res) => {
  const { type, name, date, notes, duration_seconds, exercises } = req.body;
  if (!type || !name) {
    return res.status(400).json({ error: 'type and name required' });
  }

  const insertWorkout = db.prepare(
    'INSERT INTO workouts (user_id, type, name, date, notes, duration_seconds) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertExercise = db.prepare(
    'INSERT INTO exercises (workout_id, name, sets, reps, weight, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const transaction = db.transaction(() => {
    const workout = insertWorkout.run(
      req.userId, type, name,
      date || new Date().toISOString().split('T')[0],
      notes || null,
      duration_seconds || 0
    );
    const workoutId = workout.lastInsertRowid;
    if (exercises && exercises.length) {
      for (const ex of exercises) {
        insertExercise.run(workoutId, ex.name, ex.sets || 1, ex.reps || null, ex.weight || null, ex.duration_minutes || null);
      }
    }
    return workoutId;
  });

  const id = transaction();

  // ── Detect Personal Records ──────────────────────────────────────────────
  const newPRs = [];
  if (exercises && exercises.length) {
    const workoutDate = req.body.date || new Date().toISOString().split('T')[0];
    for (const ex of exercises) {
      if (!ex.weight || ex.weight <= 0 || !ex.reps || ex.reps <= 0) continue;
      // Epley 1RM formula: weight × (1 + reps/30)
      const oneRepMax = Math.round(ex.weight * (1 + ex.reps / 30) * 10) / 10;
      const existing = db.prepare(
        'SELECT * FROM personal_records WHERE user_id = ? AND exercise_name = ?'
      ).get(req.userId, ex.name);

      if (!existing || oneRepMax > existing.one_rep_max) {
        db.prepare(`
          INSERT INTO personal_records (user_id, exercise_name, weight, reps, one_rep_max, date, workout_id)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, exercise_name) DO UPDATE SET
            weight = excluded.weight, reps = excluded.reps,
            one_rep_max = excluded.one_rep_max, date = excluded.date, workout_id = excluded.workout_id
        `).run(req.userId, ex.name, ex.weight, ex.reps, oneRepMax, workoutDate, id);
        newPRs.push({ exercise: ex.name, weight: ex.weight, reps: ex.reps, oneRepMax });
      }
    }
  }

  const result = db.prepare(`
    SELECT w.*,
      json_group_array(json_object(
        'id', e.id, 'name', e.name, 'sets', e.sets,
        'reps', e.reps, 'weight', e.weight, 'duration_minutes', e.duration_minutes
      )) as exercises
    FROM workouts w LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.id = ? GROUP BY w.id
  `).get(id);

  result.exercises = JSON.parse(result.exercises).filter(e => e.id !== null);
  result.newPRs = newPRs;
  res.status(201).json(result);
});

// POST /api/workouts/:id/feeling — save how the user felt during this workout
router.post('/:id/feeling', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!workout) return res.status(404).json({ error: 'Workout not found' });

  const { sleep_hours, sleep_quality, energy_level, soreness_level, notes } = req.body;

  const existing = db.prepare('SELECT id FROM workout_feelings WHERE workout_id = ?').get(req.params.id);
  if (existing) {
    db.prepare(`UPDATE workout_feelings SET sleep_hours = ?, sleep_quality = ?, energy_level = ?, soreness_level = ?, notes = ? WHERE workout_id = ?`)
      .run(sleep_hours ?? null, sleep_quality ?? null, energy_level ?? null, soreness_level ?? null, notes || null, req.params.id);
  } else {
    db.prepare(`INSERT INTO workout_feelings (workout_id, sleep_hours, sleep_quality, energy_level, soreness_level, notes) VALUES (?, ?, ?, ?, ?, ?)`)
      .run(req.params.id, sleep_hours ?? null, sleep_quality ?? null, energy_level ?? null, soreness_level ?? null, notes || null);
  }

  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  const workout = db.prepare('SELECT * FROM workouts WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!workout) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM exercises WHERE workout_id = ?').run(req.params.id);
  db.prepare('DELETE FROM workouts WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
