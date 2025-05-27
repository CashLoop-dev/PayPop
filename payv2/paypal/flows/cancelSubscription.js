const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function cancelSubscription(subscriptionId) {
  const token = await getAccessToken();

  // Get subscription details
  const detailRes = await axios.get(`${BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Cancel the subscription
  await axios.post(`${BASE_URL}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    reason: 'User request',
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return detailRes.data;
}

module.exports = cancelSubscription;
