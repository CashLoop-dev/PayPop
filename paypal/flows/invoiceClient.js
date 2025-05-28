const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

/**
 * Create and send a PayPal invoice.
 * @param {Object} params
 * @param {string} params.fromEmail - Invoicer's email address
 * @param {string} params.toEmail - Recipient's email address
 * @param {string} params.itemName - Product or service name
 * @param {number} params.cost - Cost of the product/service
 * @param {number} params.taxPercent - Tax percentage (e.g., 10 for 10%)
 * @param {number} params.discountPercent - Discount percentage (e.g., 5 for 5%)
 * @param {string} [params.logoUrl] - URL of the logo to be displayed on the invoice
 * @param {string} [params.defaultTerms] - Default terms and conditions for the invoice
 * @returns {Promise<string>} Invoice ID
 */
async function invoiceClient({
  fromEmail,
  toEmail,
  itemName,
  cost,
  taxPercent,
  discountPercent,
  logoUrl,
  defaultTerms
}) {
  const token = await getAccessToken();

  // Build invoice payload
  const invoicePayload = {
    detail: {
      invoice_number: `INV-${Date.now()}`,
      currency_code: 'USD',
      note: 'Thank you for your business!',
      terms_and_conditions: defaultTerms || 'Payment due upon receipt.',
      ...(logoUrl ? { logo_url: logoUrl } : {})
    },
    invoicer: {
      email_address: fromEmail
    },
    primary_recipients: [
      { billing_info: { email_address: toEmail } }
    ],
    items: [
      {
        name: itemName,
        quantity: '1',
        unit_amount: { currency_code: 'USD', value: cost.toFixed(2) },
        tax: { name: 'Tax', percent: taxPercent.toString() },
        discount: { percent: discountPercent.toString() }
      }
    ]
  };

  // Create invoice
  const invoiceRes = await axios.post(
    `${BASE_URL}/v2/invoicing/invoices`,
    invoicePayload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const invoiceId = invoiceRes.data.id;

  // Send invoice
  await axios.post(
    `${BASE_URL}/v2/invoicing/invoices/${invoiceId}/send`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return invoiceId;
}

module.exports = invoiceClient;

// For listing invoices (unchanged)
module.exports.getInvoices = async function getInvoices() {
  const token = await getAccessToken();
  const res = await axios.get(`${BASE_URL}/v2/invoicing/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.items || [];
};
