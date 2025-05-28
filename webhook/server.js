const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
// const logger = require('../logger');

const paypalWebhook = require('./paypal');
const squareWebhook = require('./square');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Mount both webhook handlers
app.use('/webhook/paypal', paypalWebhook);
app.use('/webhook/square', squareWebhook);

// Health check
app.get('/', (req, res) => res.send('✅ Webhook server is running'));

app.listen(PORT, () => {
  console.log(`✅ Webhook server listening at http://localhost:${PORT}`);
});
