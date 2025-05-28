const { getSquareClient } = require('../restClient');
async function createCustomer({ givenName, familyName, email, phone }) {
  const client = getSquareClient();
  const { result } = await client.customersApi.createCustomer({
    givenName,
    familyName,
    emailAddress: email,
    phoneNumber: phone,
  });
  return result.customer;
}
async function listCustomers() {
  const client = getSquareClient();
  const { result } = await client.customersApi.listCustomers();
  return result.customers || [];
}
async function getCustomer(customerId) {
  const client = getSquareClient();
  const { result } = await client.customersApi.retrieveCustomer(customerId);
  return result.customer;
}
async function updateCustomer(customerId, updates) {
  const client = getSquareClient();
  const { result } = await client.customersApi.updateCustomer(customerId, updates);
  return result.customer;
}
async function deleteCustomer(customerId) {
  const client = getSquareClient();
  await client.customersApi.deleteCustomer(customerId);
  return true;
}
module.exports = {
  createCustomer,
  listCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
