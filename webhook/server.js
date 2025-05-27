const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Endpoint to handle PayPal webhook events
app.post('/webhook', (req, res) => {
    // TODO: Implement webhook event handling logic
    res.status(200).send('Webhook event received');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});

module.exports = app;