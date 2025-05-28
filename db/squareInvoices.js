const { db } = require('./connection');

// Create table if not exists
// Ensure the square invoices table exists
db.run(`
  CREATE TABLE IF NOT EXISTS square_invoices (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    customer_id TEXT,
    amount REAL,
    status TEXT DEFAULT 'PENDING',
    note TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
  `);

const saveSquareInvoice = (userId, invoiceId, customerId, amount, note) => new Promise((resolve, reject) => {
  db.run(
    `INSERT OR IGNORE INTO square_invoices (id, user_id, customer_id, amount, note) VALUES (?, ?, ?, ?, ?)`,
    [invoiceId, userId, customerId, amount, note],
    function (err) {
      if (err) {
        console.error('Failed to save Square invoice:', err);
        return reject(err);
      }
      resolve(true);
    }
  );
});

const updateSquareInvoiceStatus = (invoiceId, status) => new Promise((resolve, reject) => {
  db.run(
    `UPDATE square_invoices SET status = ? WHERE id = ?`,
    [status, invoiceId],
    function (err) {
      if (err) {
        console.error('Failed to update Square invoice status:', err);
        return reject(err);
      }
      resolve(true);
    }
  );
});

const listSquareInvoicesByUser = (userId) => new Promise((resolve, reject) => {
  db.all(
    `SELECT * FROM square_invoices WHERE user_id = ? ORDER BY created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to list Square invoices:', err);
        return reject(err);
      }
      resolve(rows);
    }
  );
});

module.exports = { saveSquareInvoice, updateSquareInvoiceStatus, listSquareInvoicesByUser };
