const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Ensure table exists
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

const CHECKIN_MESSAGES = {
  no_workout: [
    "Hey! How has your training been feeling lately? 💪",
    "We noticed you haven't logged a workout in a few days — totally okay! Just checking in. How are you feeling? 🙂",
    "Rest days are important, but we miss seeing you train! Everything good? 💙",
  ],
  no_meals: [
    "Just checking in — how are you doing with your nutrition this week? 🥗",
    "Haven't seen any meal logs lately — no worries, life gets busy! How are you feeling overall? 😊",
    "Nutrition check-in! How's the eating been going this week? 🥦",
  ],
  general: [
    "We noticed you've been a bit quiet lately — everything okay? We're here if you need anything 💙",
    "Hey, just wanted to check in and see how you're doing. Your wellness matters! 🌟",
  ],
};

function pickMessage(type) {
  const msgs = CHECKIN_MESSAGES[type] || CHECKIN_MESSAGES.general;
  return msgs[Math.floor(Math.random() * msgs.length)];
}

// GET /api/wellness — get latest unanswered checkin, or auto-create one if needed
router.get('/', (req, res) => {
  // First check for existing unanswered
  const existing = db.prepare(`
    SELECT * FROM wellness_checkins
    WHERE user_id = ? AND response IS NULL
    ORDER BY created_at DESC LIMIT 1
  `).get(req.userId);

  if (existing) return res.json(existing);

  // Check if we should create a new one
  const lastWorkout = db.prepare(`
    SELECT date FROM workouts WHERE user_id = ? ORDER BY date DESC LIMIT 1
  `).get(req.userId);

  const lastMeal = db.prepare(`
    SELECT date FROM meals WHERE user_id = ? ORDER BY date DESC LIMIT 1
  `).get(req.userId);

  const today = new Date();
  const daysSinceWorkout = lastWorkout
    ? Math.floor((today - new Date(lastWorkout.date)) / 86400000)
    : 999;
  const daysSinceMeal = lastMeal
    ? Math.floor((today - new Date(lastMeal.date)) / 86400000)
    : 999;

  let type = null;
  if (daysSinceWorkout >= 4) type = 'no_workout';
  else if (daysSinceMeal >= 4) type = 'no_meals';

  if (!type) return res.json(null);

  // Check we haven't sent one in the last 3 days
  const recentCheckin = db.prepare(`
    SELECT id FROM wellness_checkins
    WHERE user_id = ? AND created_at >= datetime('now', '-3 days')
    ORDER BY created_at DESC LIMIT 1
  `).get(req.userId);

  if (recentCheckin) return res.json(null);

  const message = pickMessage(type);
  const result = db.prepare(`
    INSERT INTO wellness_checkins (user_id, type, message) VALUES (?, ?, ?)
  `).run(req.userId, type, message);

  const checkin = db.prepare('SELECT * FROM wellness_checkins WHERE id = ?').get(result.lastInsertRowid);
  res.json(checkin);
});

// POST /api/wellness/:id/respond
router.post('/:id/respond', (req, res) => {
  const { response } = req.body;
  const checkin = db.prepare(
    'SELECT * FROM wellness_checkins WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!checkin) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE wellness_checkins
    SET response = ?, responded_at = datetime('now')
    WHERE id = ?
  `).run(response || 'dismissed', req.params.id);

  // Detect mental health signals in response text
  const MENTAL_HEALTH_KEYWORDS = [
    'stressed','stress','anxious','anxiety','depressed','depression','sad','overwhelmed',
    'burned out','burnout','exhausted','hopeless','struggling','not okay','not good',
    'rough','hard time','difficult','crying','unmotivated','low','down','worried',
    'panic','lost','empty','numb','tired of','can\'t cope','can\'t deal'
  ];
  const lower = (response || '').toLowerCase();
  const needsSupport = MENTAL_HEALTH_KEYWORDS.some(kw => lower.includes(kw));

  res.json({ success: true, suggest_mental_health: needsSupport });
});

// POST /api/wellness/dismiss/:id — quick dismiss
router.post('/dismiss/:id', (req, res) => {
  const checkin = db.prepare(
    'SELECT * FROM wellness_checkins WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!checkin) return res.status(404).json({ error: 'Not found' });

  db.prepare(`
    UPDATE wellness_checkins SET response = 'dismissed', responded_at = datetime('now') WHERE id = ?
  `).run(req.params.id);

  res.json({ success: true });
});

module.exports = router;
