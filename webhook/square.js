const express = require('express');
// const logger = require('../logger');
const { updateSquareInvoiceStatus } = require('../db/squareInvoices');
const { updateSquareSubscriptionStatus } = require('../db/squareSubscriptions');

const app = express();
app.use(express.json());

app.post('/square', async (req, res) => {
  const event = req.body;
  const type = event.type;
  const data = event.data?.object;

  logger.info(`Square webhook received: ${type}`);

  try {
    if (type === 'invoice.paid' && data?.invoice?.id) {
      const invoiceId = data.invoice.id;
      await updateSquareInvoiceStatus(invoiceId, 'PAID');
      logger.info(`Invoice ${invoiceId} marked as PAID.`);
    }

    if (type === 'subscription.canceled' && data?.subscription?.id) {
      const subId = data.subscription.id;
      await updateSquareSubscriptionStatus(subId, 'CANCELED');
      logger.info(`Subscription ${subId} marked as CANCELED.`);
    }

    res.sendStatus(200);
  } catch (err) {
    logger.error('Webhook processing error:', err);
    res.sendStatus(500);
  }
});

module.exports = app;
