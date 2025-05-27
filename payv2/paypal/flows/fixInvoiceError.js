const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function fixInvoiceError(oldInvoiceId, email, itemName = 'Consulting', quantity = 4, unitAmount = 90.00) {
  const token = await getAccessToken();

  try {
    // Cancel old invoice
    await axios.post(`${BASE_URL}/v2/invoicing/invoices/${oldInvoiceId}/cancel`, {
      subject: 'Invoice Cancelled',
      note: 'Incorrect amount',
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Create new invoice
    const invoiceRes = await axios.post(`${BASE_URL}/v2/invoicing/invoices`, {
      detail: { currency_code: 'USD', note: `${quantity}x ${itemName} @ $${unitAmount}/unit` },
      primary_recipients: [{ billing_info: { email_address: email } }],
      items: [{
        name: itemName,
        quantity: String(quantity),
        unit_amount: { currency_code: 'USD', value: unitAmount.toFixed(2) }
      }],
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const newId = invoiceRes.data.id;

    // Send new invoice
    await axios.post(`${BASE_URL}/v2/invoicing/invoices/${newId}/send`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return newId;
  } catch (err) {
    console.error('Error in fixInvoiceError:', err?.response?.data || err);
    throw new Error('Failed to fix invoice. Please check your sandbox emails and try again.');
  }
}

module.exports = fixInvoiceError;
