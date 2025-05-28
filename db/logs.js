const { db } = require('./connection');

db.run(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    entity TEXT,
    entity_id TEXT,
    details TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);


const logAction = (userId, action, entity, entityId, details = '') => {
  try {
    db.run(
      `INSERT INTO logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)`
    ).run(userId, action, entity, entityId, details);
    return true;
  } catch (err) {
    console.error('Failed to log action:', err);
    return false;
  }
};

module.exports = { logAction };