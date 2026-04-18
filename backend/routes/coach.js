const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Ensure tables exist
db.exec(`
  CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    bio TEXT,
    specialty TEXT,
    is_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coach_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL,
    client_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (client_id) REFERENCES users(id)
  );
`);

// Add role column to users if not exists (safe migration)
try {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'`);
} catch (e) {
  // Column likely already exists
}

// POST /api/coach/become-coach
router.post('/become-coach', (req, res) => {
  const { bio, specialty } = req.body;

  // Update user role
  db.prepare(`UPDATE users SET role = 'coach' WHERE id = ?`).run(req.userId);

  // Upsert coach profile
  const existing = db.prepare('SELECT id FROM coaches WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare('UPDATE coaches SET bio = ?, specialty = ? WHERE user_id = ?')
      .run(bio || null, specialty || null, req.userId);
  } else {
    db.prepare('INSERT INTO coaches (user_id, bio, specialty) VALUES (?, ?, ?)')
      .run(req.userId, bio || null, specialty || null);
  }

  const coach = db.prepare('SELECT * FROM coaches WHERE user_id = ?').get(req.userId);
  res.json(coach);
});

// GET /api/coach/profile
router.get('/profile', (req, res) => {
  const user = db.prepare('SELECT id, username, email, role FROM users WHERE id = ?').get(req.userId);
  const coach = db.prepare('SELECT * FROM coaches WHERE user_id = ?').get(req.userId);
  res.json({ user, coach });
});

// POST /api/coach/invite/:clientEmail
router.post('/invite/:clientEmail', (req, res) => {
  const coach = db.prepare('SELECT * FROM coaches WHERE user_id = ?').get(req.userId);
  if (!coach) return res.status(403).json({ error: 'You are not a coach yet' });

  const client = db.prepare('SELECT id, username, email FROM users WHERE email = ?').get(req.params.clientEmail);
  if (!client) return res.status(404).json({ error: 'User not found with that email' });

  if (client.id === req.userId) return res.status(400).json({ error: 'Cannot invite yourself' });

  // Check if already connected
  const existing = db.prepare(
    'SELECT * FROM coach_clients WHERE coach_id = ? AND client_id = ?'
  ).get(req.userId, client.id);

  if (existing) return res.status(400).json({ error: 'Client already invited or connected' });

  db.prepare('INSERT INTO coach_clients (coach_id, client_id, status) VALUES (?, ?, ?)').run(
    req.userId, client.id, 'active'
  );

  res.json({ success: true, client: { id: client.id, username: client.username, email: client.email } });
});

// GET /api/coach/clients
router.get('/clients', (req, res) => {
  const coach = db.prepare('SELECT * FROM coaches WHERE user_id = ?').get(req.userId);
  if (!coach) return res.status(403).json({ error: 'Not a coach' });

  const clients = db.prepare(`
    SELECT u.id, u.username, u.email, cc.status, cc.created_at as connected_at
    FROM coach_clients cc
    JOIN users u ON u.id = cc.client_id
    WHERE cc.coach_id = ?
    ORDER BY cc.created_at DESC
  `).all(req.userId);

  // Enrich with stats
  const enriched = clients.map(client => {
    const latestWeight = db.prepare(`
      SELECT weight, date FROM body_weight WHERE user_id = ? ORDER BY date DESC LIMIT 1
    `).get(client.id);

    const lastWorkout = db.prepare(`
      SELECT date, name, type FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1
    `).get(client.id);

    // Calculate streak
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let checkDate = new Date();
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasWorkout = db.prepare(
        'SELECT id FROM workouts WHERE user_id = ? AND date = ?'
      ).get(client.id, dateStr);
      if (!hasWorkout) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    return {
      ...client,
      latest_weight: latestWeight || null,
      last_workout: lastWorkout || null,
      workout_streak: streak,
    };
  });

  res.json(enriched);
});

// GET /api/coach/clients/:clientId/dashboard
router.get('/clients/:clientId/dashboard', (req, res) => {
  const coach = db.prepare('SELECT * FROM coaches WHERE user_id = ?').get(req.userId);
  if (!coach) return res.status(403).json({ error: 'Not a coach' });

  // Verify this is actually a client of this coach
  const relationship = db.prepare(
    'SELECT * FROM coach_clients WHERE coach_id = ? AND client_id = ?'
  ).get(req.userId, req.params.clientId);

  if (!relationship) return res.status(403).json({ error: 'Not your client' });

  const clientId = parseInt(req.params.clientId);
  const client = db.prepare('SELECT id, username, email FROM users WHERE id = ?').get(clientId);

  const recentWorkouts = db.prepare(`
    SELECT w.id, w.type, w.name, w.date,
      COUNT(e.id) as exercise_count,
      SUM(e.sets * COALESCE(e.reps, 1) * COALESCE(e.weight, 0)) as volume
    FROM workouts w
    LEFT JOIN exercises e ON e.workout_id = w.id
    WHERE w.user_id = ?
    GROUP BY w.id
    ORDER BY w.date DESC LIMIT 10
  `).all(clientId);

  const recentWeights = db.prepare(`
    SELECT * FROM body_weight WHERE user_id = ? ORDER BY date DESC LIMIT 14
  `).all(clientId);

  const todayMeals = db.prepare(`
    SELECT * FROM meals WHERE user_id = ? AND date = date('now')
  `).all(clientId);

  const goals = db.prepare('SELECT * FROM user_goals WHERE user_id = ?').get(clientId);

  res.json({
    client,
    recentWorkouts,
    recentWeights: recentWeights.reverse(),
    todayMeals,
    goals,
  });
});

module.exports = router;
