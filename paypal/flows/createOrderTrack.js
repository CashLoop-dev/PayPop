const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function createOrderTrack(item, qty, unitPrice, trackingNumber) {
  const token = await getAccessToken();
  const amount = (qty * unitPrice).toFixed(2);

  // Create order
  const orderRes = await axios.post(`${BASE_URL}/v2/checkout/orders`, {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: 'USD', value: amount },
      description: `${qty} x ${item}`
    }],
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const orderId = orderRes.data.id;

  // Capture payment
  await axios.post(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Add tracking info
  await axios.post(`${BASE_URL}/v1/shipping/trackers-batch`, {
    trackers: [{
      transaction_id: orderId,
      tracking_number: trackingNumber,
      status: 'SHIPPED',
      carrier: 'UPS',
    }],
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return orderId;
}

module.exports = createOrderTrack;
