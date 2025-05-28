const { db } = require('./connection');

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS square_subscriptions (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    customer_id TEXT,
    email TEXT,
    plan_name TEXT,
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const saveSquareSubscription = (userId, subId, customerId, email, planName) => new Promise((resolve, reject) => {
  db.run(
    `INSERT OR IGNORE INTO square_subscriptions (id, user_id, customer_id, email, plan_name) VALUES (?, ?, ?, ?, ?)`,
    [subId, userId, customerId, email, planName],
    function (err) {
      if (err) {
        console.error('Failed to save Square subscription:', err);
        return reject(err);
      }
      resolve(true);
    }
  );
});

const updateSquareSubscriptionStatus = (subId, status) => new Promise((resolve, reject) => {
  db.run(
    `UPDATE square_subscriptions SET status = ? WHERE id = ?`,
    [status, subId],
    function (err) {
      if (err) {
        console.error('Failed to update Square subscription status:', err);
        return reject(err);
      }
      resolve(true);
    }
  );
});

const listSquareSubscriptionsByUser = (userId) => new Promise((resolve, reject) => {
  db.all(
    `SELECT * FROM square_subscriptions WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to list Square subscriptions:', err);
        return reject(err);
      }
      resolve(rows);
    }
  );
});

module.exports = {
  saveSquareSubscription,
  updateSquareSubscriptionStatus,
  listSquareSubscriptionsByUser,
};
