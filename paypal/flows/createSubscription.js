const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function createSubscription(email, name) {
  const token = await getAccessToken();

  // Create product
  const productRes = await axios.post(`${BASE_URL}/v1/catalogs/products`, {
    name: 'Coffee-Club Subscription',
    type: 'DIGITAL',
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const productId = productRes.data.id;

  // Create plan
  const planRes = await axios.post(`${BASE_URL}/v1/billing/plans`, {
    product_id: productId,
    name: 'Monthly Roast Plan',
    billing_cycles: [{
      frequency: { interval_unit: 'MONTH', interval_count: 1 },
      tenure_type: 'REGULAR',
      pricing_scheme: { fixed_price: { value: '20.00', currency_code: 'USD' } },
      sequence: 1,
      total_cycles: 0,
    }],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: 'CONTINUE',
      payment_failure_threshold: 1,
    },
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const planId = planRes.data.id;

  // Create subscription
  const subRes = await axios.post(`${BASE_URL}/v1/billing/subscriptions`, {
    plan_id: planId,
    subscriber: {
      name: { given_name: name.split(' ')[0], surname: name.split(' ')[1] || '' },
      email_address: email,
    },
    application_context: {
      brand_name: 'Coffee Club',
      user_action: 'SUBSCRIBE_NOW',
    },
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return subRes.data.id;
}

module.exports = createSubscription;
