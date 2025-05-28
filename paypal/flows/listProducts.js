const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function listProducts() {
  const token = await getAccessToken();

  const res = await axios.get(`${BASE_URL}/v1/catalogs/products`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  // PayPal returns { products: [...] }
  return res.data.products || [];
}

module.exports = listProducts;