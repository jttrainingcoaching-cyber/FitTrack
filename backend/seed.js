const bcrypt = require('bcryptjs');
const db = require('./database');

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

console.log('Seeding database...');

// Remove existing demo data
const existing = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@fittrack.app');
if (existing) {
  const wids = db.prepare('SELECT id FROM workouts WHERE user_id = ?').all(existing.id).map(w => w.id);
  for (const wid of wids) db.prepare('DELETE FROM exercises WHERE workout_id = ?').run(wid);
  db.prepare('DELETE FROM workouts WHERE user_id = ?').run(existing.id);
  db.prepare('DELETE FROM meals WHERE user_id = ?').run(existing.id);
  db.prepare('DELETE FROM body_weight WHERE user_id = ?').run(existing.id);
  db.prepare('DELETE FROM meal_presets WHERE user_id = ?').run(existing.id);
  db.prepare('DELETE FROM users WHERE id = ?').run(existing.id);
}

// Demo user
const hash = bcrypt.hashSync('demo123', 10);
const userId = db.prepare(
  'INSERT INTO users (username, email, password) VALUES (?, ?, ?)'
).run('Demo Athlete', 'demo@fittrack.app', hash).lastInsertRowid;

// Global meal presets
db.prepare('DELETE FROM meal_presets WHERE user_id IS NULL').run();
const presets = [
  { name: 'Protein Shake',      calories: 150, protein: 30, carbs: 5,  fat: 2  },
  { name: 'Chicken & Rice',     calories: 480, protein: 42, carbs: 55, fat: 8  },
  { name: 'Oatmeal + Eggs',     calories: 390, protein: 22, carbs: 48, fat: 10 },
  { name: 'Greek Yogurt',       calories: 130, protein: 18, carbs: 10, fat: 2  },
  { name: 'Steak & Potato',     calories: 620, protein: 48, carbs: 45, fat: 18 },
  { name: 'Salmon & Veggies',   calories: 420, protein: 38, carbs: 20, fat: 15 },
  { name: 'Turkey Sandwich',    calories: 380, protein: 28, carbs: 40, fat: 9  },
  { name: 'Tuna & Crackers',    calories: 240, protein: 28, carbs: 20, fat: 4  },
];
const insPreset = db.prepare('INSERT INTO meal_presets (user_id, name, calories, protein, carbs, fat) VALUES (NULL, ?, ?, ?, ?, ?)');
for (const p of presets) insPreset.run(p.name, p.calories, p.protein, p.carbs, p.fat);

// Workouts
const insWorkout = db.prepare('INSERT INTO workouts (user_id, type, name, date) VALUES (?, ?, ?, ?)');
const insExercise = db.prepare('INSERT INTO exercises (workout_id, name, sets, reps, weight) VALUES (?, ?, ?, ?, ?)');

const workoutPlan = [
  { offset: 0,  type: 'Push',   name: 'Chest & Triceps', exercises: [
    { name: 'Bench Press',           sets: 4, reps: 8,  weight: 185 },
    { name: 'Incline Dumbbell Press',sets: 3, reps: 10, weight: 70  },
    { name: 'Tricep Pushdown',       sets: 3, reps: 12, weight: 55  },
    { name: 'Lateral Raises',        sets: 3, reps: 15, weight: 20  },
  ]},
  { offset: 1,  type: 'Pull',   name: 'Back & Biceps', exercises: [
    { name: 'Pull-ups',              sets: 4, reps: 8,  weight: 0   },
    { name: 'Barbell Row',           sets: 4, reps: 8,  weight: 155 },
    { name: 'Lat Pulldown',          sets: 3, reps: 10, weight: 120 },
    { name: 'Barbell Curl',          sets: 3, reps: 10, weight: 65  },
  ]},
  { offset: 2,  type: 'Legs',   name: 'Quad Focus', exercises: [
    { name: 'Squat',                 sets: 5, reps: 5,  weight: 225 },
    { name: 'Leg Press',             sets: 4, reps: 12, weight: 320 },
    { name: 'Leg Extension',         sets: 3, reps: 15, weight: 90  },
    { name: 'Calf Raises',           sets: 4, reps: 20, weight: 100 },
  ]},
  { offset: 3,  type: 'Cardio', name: 'HIIT Sprint', exercises: [
    { name: 'Treadmill Intervals',   sets: 8, reps: null, weight: null },
    { name: 'Jump Rope',             sets: 5, reps: null, weight: null },
  ]},
  { offset: 5,  type: 'Push',   name: 'Shoulder Day', exercises: [
    { name: 'Overhead Press',        sets: 4, reps: 8,  weight: 135 },
    { name: 'Lateral Raises',        sets: 4, reps: 15, weight: 22  },
    { name: 'Front Raises',          sets: 3, reps: 12, weight: 20  },
    { name: 'Skull Crushers',        sets: 3, reps: 12, weight: 80  },
  ]},
  { offset: 6,  type: 'Pull',   name: 'Deadlift Day', exercises: [
    { name: 'Deadlift',              sets: 4, reps: 5,  weight: 275 },
    { name: 'T-Bar Row',             sets: 4, reps: 10, weight: 90  },
    { name: 'Face Pulls',            sets: 3, reps: 15, weight: 50  },
    { name: 'Hammer Curl',           sets: 3, reps: 12, weight: 35  },
  ]},
  { offset: 7,  type: 'Legs',   name: 'Hamstring Focus', exercises: [
    { name: 'Romanian Deadlift',     sets: 4, reps: 10, weight: 185 },
    { name: 'Leg Curl',              sets: 4, reps: 12, weight: 80  },
    { name: 'Hip Thrust',            sets: 4, reps: 12, weight: 185 },
    { name: 'Walking Lunges',        sets: 3, reps: 16, weight: 50  },
  ]},
  { offset: 9,  type: 'Cardio', name: 'Zone 2 Cardio', exercises: [
    { name: 'Elliptical',            sets: 1, reps: null, weight: null },
    { name: 'Stair Climber',         sets: 1, reps: null, weight: null },
  ]},
  { offset: 11, type: 'Push',   name: 'Chest Volume', exercises: [
    { name: 'Incline Bench Press',   sets: 4, reps: 10, weight: 165 },
    { name: 'Cable Flyes',           sets: 4, reps: 15, weight: 40  },
    { name: 'Push-ups',              sets: 3, reps: 20, weight: 0   },
    { name: 'Tricep Extension',      sets: 3, reps: 12, weight: 60  },
  ]},
  { offset: 12, type: 'Pull',   name: 'Width Focus', exercises: [
    { name: 'Wide Grip Pull-ups',    sets: 4, reps: 6,  weight: 0   },
    { name: 'Straight Arm Pulldown', sets: 4, reps: 12, weight: 55  },
    { name: 'Seated Cable Row',      sets: 3, reps: 12, weight: 130 },
    { name: 'Preacher Curl',         sets: 3, reps: 10, weight: 55  },
  ]},
];

for (const w of workoutPlan) {
  const wid = insWorkout.run(userId, w.type, w.name, daysAgo(w.offset)).lastInsertRowid;
  for (const ex of w.exercises) insExercise.run(wid, ex.name, ex.sets, ex.reps, ex.weight);
}

// Meals (14 days)
const insMeal = db.prepare(
  'INSERT INTO meals (user_id, name, date, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?)'
);
const mealDays = [
  [
    { name: 'Oatmeal + Eggs',     calories: 390, protein: 22, carbs: 48, fat: 10 },
    { name: 'Protein Shake',      calories: 150, protein: 30, carbs: 5,  fat: 2  },
    { name: 'Chicken & Rice',     calories: 480, protein: 42, carbs: 55, fat: 8  },
    { name: 'Greek Yogurt',       calories: 130, protein: 18, carbs: 10, fat: 2  },
    { name: 'Steak & Potato',     calories: 620, protein: 48, carbs: 45, fat: 18 },
  ],
  [
    { name: 'Scrambled Eggs',     calories: 280, protein: 20, carbs: 4,  fat: 20 },
    { name: 'Turkey Sandwich',    calories: 380, protein: 28, carbs: 40, fat: 9  },
    { name: 'Protein Shake',      calories: 150, protein: 30, carbs: 5,  fat: 2  },
    { name: 'Salmon & Veggies',   calories: 420, protein: 38, carbs: 20, fat: 15 },
    { name: 'Tuna & Crackers',    calories: 240, protein: 28, carbs: 20, fat: 4  },
  ],
];
for (let i = 0; i < 14; i++) {
  for (const m of mealDays[i % 2]) {
    insMeal.run(userId, m.name, daysAgo(i), m.calories, m.protein, m.carbs, m.fat);
  }
}

// Body weight (30 days — gradual cut from 185 → 179)
const insWeight = db.prepare('INSERT INTO body_weight (user_id, weight, date) VALUES (?, ?, ?)');
for (let i = 30; i >= 0; i--) {
  if (i % 2 === 0) {
    const w = (185 - (30 - i) * 0.2).toFixed(1);
    insWeight.run(userId, parseFloat(w), daysAgo(i));
  }
}

// Seed a sample wellness check-in (unanswered)
try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS wellness_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      response TEXT,
      responded_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  db.prepare('DELETE FROM wellness_checkins WHERE user_id = ?').run(userId);
  db.prepare(
    `INSERT INTO wellness_checkins (user_id, type, message, created_at) VALUES (?, ?, ?, datetime('now', '-1 day'))`
  ).run(userId, 'general', "Hey! How has your training been feeling lately? 💪");
} catch (e) {
  console.log('Note: wellness_checkins seed skipped:', e.message);
}

console.log('✓ Demo user: demo@fittrack.app / demo123');
console.log('✓ 10 workout sessions seeded');
console.log('✓ 14 days of meals seeded');
console.log('✓ 30 days of body weight seeded');
console.log('✓ 8 meal presets seeded');
console.log('✓ 1 sample wellness check-in seeded');
