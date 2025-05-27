const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '.'); // This is now the current 'db' directory inside 'payv2'
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = path.join(dbDir, 'paypop.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to SQLite database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

const connectDB = async () => {
    // No-op for sqlite3, connection is handled above
};

module.exports = {
    db,
    connectDB,
};