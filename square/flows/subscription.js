const { getSquareClient } = require('../restClient');
async function createSubscription({ customerId, planId, startDate }) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.createSubscription({
    idempotencyKey: Date.now().toString(),
    locationId: process.env.SQUARE_LOCATION_ID,
    planId,
    customerId,
    startDate,
  });
  return result.subscription;
}
async function listSubscriptions() {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.searchSubscriptions({
    locationIds: [process.env.SQUARE_LOCATION_ID],
  });
  return result.subscriptions || [];
}
async function getSubscription(subscriptionId) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.retrieveSubscription(subscriptionId);
  return result.subscription;
}
async function cancelSubscription(subscriptionId) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.cancelSubscription(subscriptionId);
  return result.subscription;
}
module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscription,
  cancelSubscription,
};
