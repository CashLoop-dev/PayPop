const { Client } = require('pg'); // Assuming PostgreSQL is used

const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async () => {
    try {
        await client.connect();
        console.log('Database connected successfully');
    } catch (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    }
};

module.exports = {
    client,
    connectDB,
};