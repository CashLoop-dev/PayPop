const {
  invoicesApi
} = require('../restClient');
const { v4: uuid } = require('uuid');

/**
 * Create and publish a Square invoice for a customer.
 * @param {string} customerId
 * @param {number} amount
 * @param {string} note
 * @returns {Promise<string>} invoiceId
 */
async function createInvoice(customerId, amount, note) {
  if (!process.env.SQUARE_LOCATION_ID) {
    throw new Error('Missing SQUARE_LOCATION_ID environment variable.');
  }
  try {
    // Step 1: Create invoice draft
    const createRes = await invoicesApi.createInvoice({
      idempotencyKey: uuid(),
      invoice: {
        locationId: process.env.SQUARE_LOCATION_ID,
        customerId,
        primaryRecipient: { customerId },
        paymentRequests: [{
          requestType: 'BALANCE',
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
          fixedAmountRequestedMoney: {
            amount: Math.round(amount * 100),
            currency: 'USD'
          }
        }],
        deliveryMethod: 'EMAIL',
        title: 'Service Invoice',
        description: note
      }
    });

    const invoiceId = createRes.result.invoice.id;
    const version = createRes.result.invoice.version;

    // Step 2: Publish the invoice
    await invoicesApi.publishInvoice(invoiceId, {
      idempotencyKey: uuid(),
      version
    });

    return invoiceId;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (createInvoice):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to create or publish invoice: ${err.message}`);
  }
}

module.exports = { createInvoice };
