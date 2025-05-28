const { getSquareClient } = require('../restClient');
async function createOrder(lineItems) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.createOrder({
    order: {
      locationId: process.env.SQUARE_LOCATION_ID,
      lineItems,
    }
  });
  return result.order;
}
async function listOrders() {
  const client = getSquareClient();
  const { result } = await client.ordersApi.searchOrders({
    locationIds: [process.env.SQUARE_LOCATION_ID],
  });
  return (result.orders || []);
}
async function getOrder(orderId) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.retrieveOrder(orderId);
  return result.order;
}
async function updateOrder(orderId, updates) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.updateOrder(orderId, updates);
  return result.order;
}
module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
};
