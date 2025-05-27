const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function resolveDisputes() {
  const token = await getAccessToken();

  // List open disputes
  const listRes = await axios.get(`${BASE_URL}/v1/customer/disputes?dispute_state=OPEN`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const firstDispute = listRes.data.items?.[0];
  if (!firstDispute) return null;

  const disputeId = firstDispute.dispute_id;

  // Accept the claim
  await axios.post(`${BASE_URL}/v1/customer/disputes/${disputeId}/accept-claim`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return disputeId;
}

module.exports = resolveDisputes;
