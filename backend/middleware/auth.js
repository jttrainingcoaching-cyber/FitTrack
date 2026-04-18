const jwt = require('jsonwebtoken');
const db = require('../database');
const JWT_SECRET = process.env.JWT_SECRET || 'fittrack_jwt_secret_2024';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify the user actually exists in the DB — if the DB was wiped the
    // token is technically valid JWT but references a non-existent user.
    const user = db.prepare('SELECT id FROM users WHERE id = ?').get(decoded.userId);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
