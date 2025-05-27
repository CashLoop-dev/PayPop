const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function invoiceQr(email) {
  const token = await getAccessToken();

  // Create invoice
  const invoiceRes = await axios.post(`${BASE_URL}/v2/invoicing/invoices`, {
    detail: { currency_code: 'USD' },
    primary_recipients: [{ billing_info: { email_address: email } }],
    items: [{ name: 'Pop-up Booth Entry Fee', quantity: '1', unit_amount: { currency_code: 'USD', value: '20.00' } }],
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const invoiceId = invoiceRes.data.id;

  // Send invoice
  await axios.post(`${BASE_URL}/v2/invoicing/invoices/${invoiceId}/send`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Generate QR code
  const qrRes = await axios.post(`${BASE_URL}/v2/invoicing/invoices/${invoiceId}/generate-qr-code`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    invoiceId,
    qrUrl: qrRes.data.href,
  };
}

module.exports = invoiceQr;
