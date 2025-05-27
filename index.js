const express = require('express');
const bodyParser = require('body-parser');
const { connectDB } = require('./db/connection');
require('./bot/index'); // <-- just require, don't call as function
const webhookServer = require('./webhook/server');

const app = express();
const PORT = process.env.PORT || 1337;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database connection
connectDB();

// Optionally, mount webhook server if needed
// app.use(webhookServer);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});