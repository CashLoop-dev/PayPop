const { db } = require('./connection');

// Create a new order
const createOrder = (orderData) => new Promise((resolve, reject) => {
    const { id, name, qty, price, status } = orderData;
    db.run(
        'INSERT INTO orders (id, name, qty, price, status) VALUES (?, ?, ?, ?, ?)',
        [id, name, qty, price, status],
        function (err) {
            if (err) return reject(err);
            resolve({ id: this.lastID, ...orderData });
        }
    );
});

// Get an order by ID
const getOrderById = (orderId) => new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
    });
});

// Update an existing order
const updateOrder = (orderId, updatedData) => new Promise((resolve, reject) => {
    const { name, qty, price, status } = updatedData;
    db.run(
        'UPDATE orders SET name = ?, qty = ?, price = ?, status = ? WHERE id = ?',
        [name, qty, price, status, orderId],
        function (err) {
            if (err) return reject(err);
            resolve({ id: orderId, ...updatedData });
        }
    );
});

// Delete an order
const deleteOrder = (orderId) => new Promise((resolve, reject) => {
    db.run('DELETE FROM orders WHERE id = ?', [orderId], function (err) {
        if (err) return reject(err);
        resolve({ message: 'Order deleted successfully' });
    });
});

// List all orders
const listOrders = () => new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders', [], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
    });
});

module.exports = {
    createOrder,
    getOrderById,
    updateOrder,
    deleteOrder,
    listOrders,
};