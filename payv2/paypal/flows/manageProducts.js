const { getAccessToken } = require('../restClient');
const axios = require('axios');

const BASE_URL = process.env.PAYPAL_ENVIRONMENT === 'PRODUCTION'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function manageProducts(productName) {
  const token = await getAccessToken();

  // Create product
  const createRes = await axios.post(`${BASE_URL}/v1/catalogs/products`, {
    name: productName,
    type: 'PHYSICAL',
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const productId = createRes.data.id;

  // Fetch product details
  const detailRes = await axios.get(`${BASE_URL}/v1/catalogs/products/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return detailRes.data;
}

module.exports = manageProducts;
