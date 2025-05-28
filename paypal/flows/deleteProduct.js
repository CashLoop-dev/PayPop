const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function deleteProduct(productId) {
  const token = await getAccessToken();

  await axios.delete(`${BASE_URL}/v1/catalogs/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return true;
}

module.exports = deleteProduct;