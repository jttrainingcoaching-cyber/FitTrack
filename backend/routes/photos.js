const express = require('express');
const db = require('../database');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);

// Ensure table exists
db.exec(`
  CREATE TABLE IF NOT EXISTS progress_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL DEFAULT (date('now')),
    notes TEXT,
    photo_data TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// GET /api/photos
router.get('/', (req, res) => {
  const photos = db.prepare(`
    SELECT id, user_id, date, notes, created_at,
           substr(photo_data, 1, 50) as photo_preview,
           length(photo_data) as data_length
    FROM progress_photos
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
  `).all(req.userId);
  // Return without preview — include full data
  const full = db.prepare(`
    SELECT id, user_id, date, notes, photo_data, created_at
    FROM progress_photos
    WHERE user_id = ?
    ORDER BY date DESC, created_at DESC
  `).all(req.userId);
  res.json(full);
});

// POST /api/photos
router.post('/', (req, res) => {
  const { date, notes, photo_data } = req.body;
  if (!photo_data) return res.status(400).json({ error: 'photo_data required' });

  const result = db.prepare(`
    INSERT INTO progress_photos (user_id, date, notes, photo_data)
    VALUES (?, ?, ?, ?)
  `).run(
    req.userId,
    date || new Date().toISOString().split('T')[0],
    notes || null,
    photo_data
  );

  const photo = db.prepare('SELECT id, user_id, date, notes, created_at FROM progress_photos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(photo);
});

// DELETE /api/photos/:id
router.delete('/:id', (req, res) => {
  const photo = db.prepare(
    'SELECT * FROM progress_photos WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);

  if (!photo) return res.status(404).json({ error: 'Not found' });

  db.prepare('DELETE FROM progress_photos WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
