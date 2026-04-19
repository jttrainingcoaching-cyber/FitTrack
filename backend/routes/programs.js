const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// ── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    difficulty TEXT,
    days_per_week INTEGER,
    duration_weeks INTEGER,
    is_builtin INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS program_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_id INTEGER NOT NULL,
    week INTEGER NOT NULL,
    day INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT,
    FOREIGN KEY (program_id) REFERENCES programs(id)
  );

  CREATE TABLE IF NOT EXISTS program_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    program_day_id INTEGER NOT NULL,
    exercise_name TEXT NOT NULL,
    sets INTEGER,
    reps TEXT,
    notes TEXT,
    FOREIGN KEY (program_day_id) REFERENCES program_days(id)
  );

  CREATE TABLE IF NOT EXISTS user_programs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    program_id INTEGER NOT NULL,
    started_at TEXT DEFAULT (date('now')),
    current_week INTEGER DEFAULT 1,
    current_day INTEGER DEFAULT 1,
    active INTEGER DEFAULT 1,
    completed_days TEXT DEFAULT '[]',
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (program_id) REFERENCES programs(id)
  );
`);

// ── Seed built-in programs ───────────────────────────────────────────────────
function seedPrograms() {
  const count = db.prepare('SELECT COUNT(*) as c FROM programs WHERE is_builtin = 1').get();
  if (count.c > 0) return;

  const PROGRAMS = [
    {
      name: 'Beginner Full Body',
      description: 'Perfect for newcomers. Three full-body sessions per week hitting every major muscle group with compound lifts.',
      goal: 'Build Muscle',
      difficulty: 'Beginner',
      days_per_week: 3,
      duration_weeks: 12,
      schedule: [
        // Week pattern repeats — just define one week, system loops it
        { day: 1, name: 'Full Body A', type: 'Full Body', exercises: [
          { name: 'Squat',          sets: 3, reps: '8-10',  notes: 'Keep chest up, knees tracking toes' },
          { name: 'Bench Press',    sets: 3, reps: '8-10',  notes: 'Lower bar to chest, elbows at 45°' },
          { name: 'Barbell Row',    sets: 3, reps: '8-10',  notes: 'Squeeze shoulder blades at top' },
          { name: 'Plank',          sets: 3, reps: '30-45s', notes: 'Keep hips level, breathe normally' },
        ]},
        { day: 2, name: 'Rest',          type: 'Rest', exercises: [] },
        { day: 3, name: 'Full Body B', type: 'Full Body', exercises: [
          { name: 'Deadlift',           sets: 3, reps: '6-8',  notes: 'Hinge at hips, keep back flat' },
          { name: 'Overhead Press',     sets: 3, reps: '8-10', notes: 'Brace core, press straight up' },
          { name: 'Lat Pulldown',       sets: 3, reps: '10-12', notes: 'Full stretch at top, squeeze at bottom' },
          { name: 'Dumbbell Curl',      sets: 3, reps: '10-12', notes: 'No swinging, full range of motion' },
        ]},
        { day: 4, name: 'Rest',          type: 'Rest', exercises: [] },
        { day: 5, name: 'Full Body A', type: 'Full Body', exercises: [
          { name: 'Squat',          sets: 3, reps: '8-10',  notes: 'Add small weight each week' },
          { name: 'Bench Press',    sets: 3, reps: '8-10',  notes: 'Progressive overload each session' },
          { name: 'Barbell Row',    sets: 3, reps: '8-10',  notes: 'Control the negative' },
          { name: 'Plank',          sets: 3, reps: '30-45s', notes: 'Increase time each week' },
        ]},
        { day: 6, name: 'Rest', type: 'Rest', exercises: [] },
        { day: 7, name: 'Rest', type: 'Rest', exercises: [] },
      ],
    },
    {
      name: 'Push / Pull / Legs',
      description: 'A 6-day split targeting each muscle group twice per week. Great for intermediate lifters ready to step up volume.',
      goal: 'Build Muscle',
      difficulty: 'Intermediate',
      days_per_week: 6,
      duration_weeks: 12,
      schedule: [
        { day: 1, name: 'Push Day', type: 'Push', exercises: [
          { name: 'Bench Press',        sets: 4, reps: '6-8',  notes: 'Heavy compound movement' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', notes: 'Upper chest focus' },
          { name: 'Overhead Press',     sets: 3, reps: '8-10', notes: 'Strict form, no leg drive' },
          { name: 'Lateral Raises',     sets: 4, reps: '12-15', notes: 'Light weight, feel the burn' },
          { name: 'Tricep Pushdown',    sets: 3, reps: '12-15', notes: 'Full lockout each rep' },
        ]},
        { day: 2, name: 'Pull Day', type: 'Pull', exercises: [
          { name: 'Deadlift',           sets: 4, reps: '4-6',  notes: 'King of back exercises' },
          { name: 'Barbell Row',        sets: 3, reps: '8-10', notes: 'Pull to lower chest' },
          { name: 'Lat Pulldown',       sets: 3, reps: '10-12', notes: 'Wide grip, full stretch' },
          { name: 'Face Pulls',         sets: 3, reps: '15-20', notes: 'Rear delt and rotator cuff health' },
          { name: 'Barbell Curl',       sets: 3, reps: '10-12', notes: 'Supinate wrists at top' },
        ]},
        { day: 3, name: 'Legs Day', type: 'Legs', exercises: [
          { name: 'Squat',              sets: 4, reps: '6-8',  notes: 'Hit depth, stay tight' },
          { name: 'Romanian Deadlift',  sets: 3, reps: '10-12', notes: 'Hamstring stretch at bottom' },
          { name: 'Leg Press',          sets: 3, reps: '12-15', notes: 'Full range, no knee lockout' },
          { name: 'Leg Curl',           sets: 3, reps: '12-15', notes: 'Squeeze at top' },
          { name: 'Calf Raises',        sets: 4, reps: '15-20', notes: 'Full stretch and contraction' },
        ]},
        { day: 4, name: 'Push Day 2', type: 'Push', exercises: [
          { name: 'Incline Bench Press',sets: 4, reps: '8-10', notes: 'Upper chest emphasis today' },
          { name: 'Dumbbell Fly',       sets: 3, reps: '12-15', notes: 'Wide arc, feel the stretch' },
          { name: 'Arnold Press',       sets: 3, reps: '10-12', notes: 'Rotate through full range' },
          { name: 'Cable Lateral Raise',sets: 3, reps: '15-20', notes: 'Constant tension via cable' },
          { name: 'Skull Crushers',     sets: 3, reps: '12-15', notes: 'Lower to forehead, elbows fixed' },
        ]},
        { day: 5, name: 'Pull Day 2', type: 'Pull', exercises: [
          { name: 'Pull-ups',           sets: 4, reps: '6-10',  notes: 'Add weight if easy' },
          { name: 'Cable Row',          sets: 3, reps: '10-12', notes: 'Drive elbows back' },
          { name: 'Dumbbell Row',       sets: 3, reps: '10-12', notes: 'Chest supported for isolation' },
          { name: 'Hammer Curl',        sets: 3, reps: '12-15', notes: 'Brachialis and forearm focus' },
          { name: 'Preacher Curl',      sets: 3, reps: '12-15', notes: 'No cheating at the top' },
        ]},
        { day: 6, name: 'Legs Day 2', type: 'Legs', exercises: [
          { name: 'Front Squat',        sets: 4, reps: '8-10', notes: 'Or hack squat if no front squat' },
          { name: 'Bulgarian Split Squat', sets: 3, reps: '10-12', notes: 'Each leg, brutal but effective' },
          { name: 'Hip Thrust',         sets: 4, reps: '12-15', notes: 'Full glute contraction at top' },
          { name: 'Leg Extension',      sets: 3, reps: '15-20', notes: 'VMO focus, squeeze at top' },
          { name: 'Standing Calf Raise',sets: 4, reps: '15-20', notes: 'Slow and controlled' },
        ]},
        { day: 7, name: 'Rest', type: 'Rest', exercises: [] },
      ],
    },
    {
      name: '5×5 Strength',
      description: 'Proven strength program focused on progressive overload. Add weight every session on the big three lifts.',
      goal: 'Strength',
      difficulty: 'Intermediate',
      days_per_week: 3,
      duration_weeks: 12,
      schedule: [
        { day: 1, name: 'Workout A', type: 'Full Body', exercises: [
          { name: 'Squat',       sets: 5, reps: '5', notes: 'Increase weight each session' },
          { name: 'Bench Press', sets: 5, reps: '5', notes: 'Alternate with overhead press' },
          { name: 'Barbell Row', sets: 5, reps: '5', notes: 'Overhand grip, explosive pull' },
        ]},
        { day: 2, name: 'Rest', type: 'Rest', exercises: [] },
        { day: 3, name: 'Workout B', type: 'Full Body', exercises: [
          { name: 'Squat',          sets: 5, reps: '5', notes: 'Same weight progression' },
          { name: 'Overhead Press', sets: 5, reps: '5', notes: 'Strict press, no leg drive' },
          { name: 'Deadlift',       sets: 1, reps: '5', notes: 'One all-out heavy set' },
        ]},
        { day: 4, name: 'Rest', type: 'Rest', exercises: [] },
        { day: 5, name: 'Workout A', type: 'Full Body', exercises: [
          { name: 'Squat',       sets: 5, reps: '5', notes: 'Keep adding weight' },
          { name: 'Bench Press', sets: 5, reps: '5', notes: 'Aim for new PR each week' },
          { name: 'Barbell Row', sets: 5, reps: '5', notes: 'Perfect form always' },
        ]},
        { day: 6, name: 'Rest', type: 'Rest', exercises: [] },
        { day: 7, name: 'Rest', type: 'Rest', exercises: [] },
      ],
    },
    {
      name: 'Fat Loss Circuit',
      description: 'High-intensity training designed to maximize calorie burn while preserving lean muscle. Pairs perfectly with a calorie deficit.',
      goal: 'Lose Weight',
      difficulty: 'Intermediate',
      days_per_week: 4,
      duration_weeks: 8,
      schedule: [
        { day: 1, name: 'Upper Body Circuit', type: 'Upper', exercises: [
          { name: 'Push-ups',         sets: 3, reps: '15-20',  notes: 'Minimal rest, keep moving' },
          { name: 'Dumbbell Row',     sets: 3, reps: '12-15',  notes: 'Alternate arms, no rest' },
          { name: 'Overhead Press',   sets: 3, reps: '12-15',  notes: 'Light-moderate weight' },
          { name: 'Lat Pulldown',     sets: 3, reps: '12-15',  notes: 'Full range' },
          { name: 'Burpees',          sets: 3, reps: '10',     notes: '30s rest between rounds' },
        ]},
        { day: 2, name: 'Lower Body Circuit', type: 'Legs', exercises: [
          { name: 'Goblet Squat',     sets: 4, reps: '15',     notes: 'High rep, light weight' },
          { name: 'Romanian Deadlift',sets: 3, reps: '12-15',  notes: 'Hip hinge movement' },
          { name: 'Walking Lunges',   sets: 3, reps: '20 steps', notes: 'Feel the burn' },
          { name: 'Hip Thrust',       sets: 3, reps: '15-20',  notes: 'Glute focus' },
          { name: 'Jump Squats',      sets: 3, reps: '10',     notes: 'Explosive power' },
        ]},
        { day: 3, name: 'Rest / Cardio', type: 'Cardio', exercises: [
          { name: 'Treadmill Intervals', sets: 1, reps: '20 min', notes: '1 min fast / 1 min walk' },
        ]},
        { day: 4, name: 'Full Body HIIT', type: 'Full Body', exercises: [
          { name: 'Deadlift',          sets: 4, reps: '8',    notes: 'Moderate weight' },
          { name: 'Bench Press',       sets: 4, reps: '10',   notes: 'Superset with row' },
          { name: 'Mountain Climbers', sets: 3, reps: '30s',  notes: 'Fast pace' },
          { name: 'Box Jumps',         sets: 3, reps: '8',    notes: 'Land softly' },
          { name: 'Plank',             sets: 3, reps: '45s',  notes: 'Core stability' },
        ]},
        { day: 5, name: 'Rest', type: 'Rest', exercises: [] },
        { day: 6, name: 'Active Recovery', type: 'Cardio', exercises: [
          { name: 'Incline Walk',      sets: 1, reps: '30 min', notes: 'Zone 2 cardio, easy pace' },
        ]},
        { day: 7, name: 'Rest', type: 'Rest', exercises: [] },
      ],
    },
  ];

  const insertProgram = db.prepare(
    'INSERT INTO programs (name, description, goal, difficulty, days_per_week, duration_weeks) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const insertDay = db.prepare(
    'INSERT INTO program_days (program_id, week, day, name, type) VALUES (?, ?, ?, ?, ?)'
  );
  const insertExercise = db.prepare(
    'INSERT INTO program_exercises (program_day_id, exercise_name, sets, reps, notes) VALUES (?, ?, ?, ?, ?)'
  );

  const seed = db.transaction(() => {
    for (const prog of PROGRAMS) {
      const { lastInsertRowid: progId } = insertProgram.run(
        prog.name, prog.description, prog.goal, prog.difficulty,
        prog.days_per_week, prog.duration_weeks
      );
      // Repeat the weekly schedule across all weeks
      for (let week = 1; week <= prog.duration_weeks; week++) {
        for (const day of prog.schedule) {
          const { lastInsertRowid: dayId } = insertDay.run(progId, week, day.day, day.name, day.type);
          for (const ex of day.exercises) {
            insertExercise.run(dayId, ex.name, ex.sets, ex.reps, ex.notes);
          }
        }
      }
    }
  });

  seed();
}

try { seedPrograms(); } catch (e) { console.error('Program seed error:', e.message); }

// ── Routes ───────────────────────────────────────────────────────────────────

// GET /api/programs — list all programs
router.get('/', (req, res) => {
  const programs = db.prepare('SELECT * FROM programs ORDER BY difficulty ASC').all();
  res.json(programs);
});

// GET /api/programs/:id — program details + today's workout
router.get('/:id', (req, res) => {
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
  if (!program) return res.status(404).json({ error: 'Program not found' });

  const days = db.prepare('SELECT * FROM program_days WHERE program_id = ? AND week = 1 ORDER BY day ASC').all(program.id);
  const schedule = days.map(d => ({
    ...d,
    exercises: db.prepare('SELECT * FROM program_exercises WHERE program_day_id = ?').all(d.id),
  }));

  res.json({ ...program, schedule });
});

// POST /api/programs/:id/start — start a program
router.post('/:id/start', (req, res) => {
  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(req.params.id);
  if (!program) return res.status(404).json({ error: 'Program not found' });

  // Deactivate any existing active program
  db.prepare('UPDATE user_programs SET active = 0 WHERE user_id = ?').run(req.userId);

  const result = db.prepare(
    'INSERT INTO user_programs (user_id, program_id, current_week, current_day, active) VALUES (?, ?, 1, 1, 1)'
  ).run(req.userId, program.id);

  res.json({ success: true, userProgramId: result.lastInsertRowid });
});

// GET /api/programs/active/today — get today's workout from active program
router.get('/active/today', (req, res) => {
  const up = db.prepare(
    'SELECT * FROM user_programs WHERE user_id = ? AND active = 1 ORDER BY id DESC LIMIT 1'
  ).get(req.userId);

  if (!up) return res.json({ active: false });

  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(up.program_id);
  const todayDay = db.prepare(
    'SELECT * FROM program_days WHERE program_id = ? AND week = ? AND day = ?'
  ).get(up.program_id, up.current_week, up.current_day);

  if (!todayDay) return res.json({ active: true, program, done: true });

  const exercises = todayDay.type === 'Rest' ? [] :
    db.prepare('SELECT * FROM program_exercises WHERE program_day_id = ?').all(todayDay.id);

  const completedDays = JSON.parse(up.completed_days || '[]');

  res.json({
    active: true,
    program,
    userProgram: up,
    today: { ...todayDay, exercises },
    completedDays,
    progressPercent: Math.round((completedDays.length / (program.duration_weeks * 7)) * 100),
  });
});

// POST /api/programs/active/advance — mark today done, advance to next day
router.post('/active/advance', (req, res) => {
  const up = db.prepare(
    'SELECT * FROM user_programs WHERE user_id = ? AND active = 1 ORDER BY id DESC LIMIT 1'
  ).get(req.userId);

  if (!up) return res.status(404).json({ error: 'No active program' });

  const program = db.prepare('SELECT * FROM programs WHERE id = ?').get(up.program_id);
  const completedDays = JSON.parse(up.completed_days || '[]');
  const dayKey = `${up.current_week}-${up.current_day}`;
  if (!completedDays.includes(dayKey)) completedDays.push(dayKey);

  let nextWeek = up.current_week;
  let nextDay  = up.current_day + 1;

  if (nextDay > 7) {
    nextDay = 1;
    nextWeek += 1;
  }

  // Program complete
  if (nextWeek > program.duration_weeks) {
    db.prepare('UPDATE user_programs SET active = 0, completed_days = ? WHERE id = ?')
      .run(JSON.stringify(completedDays), up.id);
    return res.json({ complete: true });
  }

  db.prepare(
    'UPDATE user_programs SET current_week = ?, current_day = ?, completed_days = ? WHERE id = ?'
  ).run(nextWeek, nextDay, JSON.stringify(completedDays), up.id);

  res.json({ success: true, current_week: nextWeek, current_day: nextDay });
});

// DELETE /api/programs/active — quit active program
router.delete('/active', (req, res) => {
  db.prepare('UPDATE user_programs SET active = 0 WHERE user_id = ?').run(req.userId);
  res.json({ success: true });
});

module.exports = router;
