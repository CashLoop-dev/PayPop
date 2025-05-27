const express = require('express');
const bodyParser = require('body-parser');
const { handleWebhookEvent } = require('../paypal/flows/invoiceClient'); // Adjust the import based on your actual flow

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Endpoint to handle PayPal webhook events
app.post('/webhook', (req, res) => {
    const event = req.body;

    // Process the webhook event
    handleWebhookEvent(event)
        .then(() => {
            res.status(200).send('Webhook event processed');
        })
        .catch((error) => {
            console.error('Error processing webhook event:', error);
            res.status(500).send('Internal Server Error');
        });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Webhook server is running on port ${PORT}`);
});