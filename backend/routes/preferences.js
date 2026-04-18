const express = require('express');
const db      = require('../database');
const auth    = require('../middleware/auth');

const router = express.Router();
router.use(auth);

function getOrCreate(userId) {
  let prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);
  if (!prefs) {
    db.prepare('INSERT INTO user_preferences (user_id) VALUES (?)').run(userId);
    prefs = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(userId);
  }
  return prefs;
}

// GET /api/preferences
router.get('/', (req, res) => {
  res.json(getOrCreate(req.userId));
});

// PUT /api/preferences
router.put('/', (req, res) => {
  const { minimal_mode, prenatal_mode, prenatal_role, focus_exercise } = req.body;
  getOrCreate(req.userId); // ensure row exists

  const fields = [];
  const vals   = [];

  if (minimal_mode   !== undefined) { fields.push('minimal_mode = ?');   vals.push(minimal_mode ? 1 : 0); }
  if (prenatal_mode  !== undefined) { fields.push('prenatal_mode = ?');  vals.push(prenatal_mode ? 1 : 0); }
  if (prenatal_role  !== undefined) { fields.push('prenatal_role = ?');  vals.push(prenatal_role); }
  if (focus_exercise !== undefined) { fields.push('focus_exercise = ?'); vals.push(focus_exercise); }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    vals.push(req.userId);
    db.prepare(`UPDATE user_preferences SET ${fields.join(', ')} WHERE user_id = ?`).run(...vals);
  }

  res.json(getOrCreate(req.userId));
});

module.exports = router;
