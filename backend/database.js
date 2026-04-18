const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

// In production, use a persistent data directory if available
const dataDir = process.env.DATA_DIR || __dirname;
if (process.env.DATA_DIR && !fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(path.join(dataDir, 'fitness.db'));

db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('Push','Pull','Legs','Cardio','Full Body','Upper','Lower')),
    name TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    notes TEXT,
    duration_seconds INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER NOT NULL DEFAULT 1,
    reps INTEGER,
    weight REAL,
    duration_minutes INTEGER,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    calories INTEGER NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS body_weight (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    weight REAL NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS meal_presets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    calorie_goal INTEGER DEFAULT 2000,
    protein_goal REAL DEFAULT 150,
    carbs_goal REAL DEFAULT 250,
    fat_goal REAL DEFAULT 65,
    steps_goal INTEGER DEFAULT 10000,
    water_goal_oz REAL DEFAULT 64,
    workout_days_per_week INTEGER DEFAULT 4,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    height_in REAL,
    date_of_birth TEXT,
    gender TEXT,
    unit_system TEXT DEFAULT 'imperial',
    fitness_goal TEXT DEFAULT 'maintain',
    activity_level TEXT DEFAULT 'moderate',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS body_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    weight_lbs REAL,
    body_fat_pct REAL,
    waist_in REAL,
    chest_in REAL,
    arms_in REAL,
    hips_in REAL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS workout_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS template_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER DEFAULT 3,
    reps INTEGER,
    weight REAL,
    rest_seconds INTEGER DEFAULT 60,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (template_id) REFERENCES workout_templates(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS workout_feelings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER UNIQUE NOT NULL,
    sleep_hours REAL,
    sleep_quality INTEGER,
    energy_level INTEGER,
    soreness_level INTEGER,
    notes TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS water_intake (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    amount_oz REAL NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    minimal_mode INTEGER DEFAULT 0,
    prenatal_mode INTEGER DEFAULT 0,
    prenatal_role TEXT DEFAULT 'pregnant',
    focus_exercise TEXT DEFAULT '',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

db.transaction = function (fn) {
  return function (...args) {
    db.exec('BEGIN');
    try {
      const result = fn(...args);
      db.exec('COMMIT');
      return result;
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  };
};

module.exports = db;
