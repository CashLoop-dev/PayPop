const express = require('express');
const bodyParser = require('body-parser');
const dbConnection = require('./db/connection');
const botLoader = require('./bot/index');
const webhookServer = require('./webhook/server');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize database connection
dbConnection();

// Load the bot
botLoader();

// Set up webhook server
webhookServer(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});