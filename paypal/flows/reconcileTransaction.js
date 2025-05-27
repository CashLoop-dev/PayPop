const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function reconcileTransaction(orderId) {
  const token = await getAccessToken();

  // Get transactions for the month (adjust dates as needed)
  const transactions = await axios.get(`${BASE_URL}/v1/reporting/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      start_date: '2024-05-01T00:00:00-0700',
      end_date: '2024-05-31T23:59:59-0700'
    }
  });

  // Get order details
  const orderDetails = await axios.get(`${BASE_URL}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    transactions: transactions.data.transaction_details,
    order: orderDetails.data,
  };
}

module.exports = reconcileTransaction;
