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
 * @returns {Promise<string>} Invoice ID
 */
async function invoiceClient({
  fromEmail,
  toEmail,
  itemName,
  cost,
  taxPercent,
  discountPercent
}) {
  const token = await getAccessToken();

  // Calculate tax and discount
  const taxAmount = cost * (taxPercent / 100);
  const discountAmount = cost * (discountPercent / 100);
  const total = cost + taxAmount - discountAmount;

  // Build invoice payload
  const invoicePayload = {
    detail: {
      currency_code: 'USD',
      note: `Invoice from ${fromEmail}`,
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
        tax: taxPercent > 0 ? {
          name: 'Tax',
          percent: taxPercent.toFixed(2)
        } : undefined,
        discount: discountPercent > 0 ? {
          percent: discountPercent.toFixed(2)
        } : undefined
      }
    ],
    amount: {
      breakdown: {
        item_total: { currency_code: 'USD', value: cost.toFixed(2) },
        tax_total: { currency_code: 'USD', value: taxAmount.toFixed(2) },
        discount: { currency_code: 'USD', value: discountAmount.toFixed(2) }
      },
      currency_code: 'USD',
      value: total.toFixed(2)
    }
  };

  // Remove undefined fields (tax/discount if 0)
  invoicePayload.items[0] = Object.fromEntries(
    Object.entries(invoicePayload.items[0]).filter(([_, v]) => v !== undefined)
  );

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
