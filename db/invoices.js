const { db } = require('./connection');

// Create a new invoice
const createInvoice = (invoiceData) => new Promise((resolve, reject) => {
    const { id, customer, amount, status } = invoiceData;
    db.run(
        'INSERT INTO invoices (id, customer, amount, status) VALUES (?, ?, ?, ?)',
        [id, customer, amount, status],
        function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...invoiceData });
        }
    );
});

// Retrieve an invoice by ID
const getInvoiceById = (invoiceId) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM invoices WHERE id = ?', [invoiceId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
    });
});

// Update an existing invoice
const updateInvoice = (invoiceId, updateData) => new Promise((resolve, reject) => {
    const { customer, amount, status } = updateData;
    db.run(
        'UPDATE invoices SET customer = ?, amount = ?, status = ? WHERE id = ?',
        [customer, amount, status, invoiceId],
        function (err) {
            if (err) return reject(err);
            resolve({ id: invoiceId, ...updateData });
        }
    );
});

// Delete an invoice
const deleteInvoice = (invoiceId) => new Promise((resolve, reject) => {
    db.run('DELETE FROM invoices WHERE id = ?', [invoiceId], function (err) {
        if (err) return reject(err);
        resolve({ message: 'Invoice deleted successfully' });
    });
});

// List all invoices
const listInvoices = () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM invoices', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
});

module.exports = {
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    listInvoices
};