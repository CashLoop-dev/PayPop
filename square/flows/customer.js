const { customersApi } = require('../restClient');
const { v4: uuid } = require('uuid');

/**
 * Create a new Square customer.
 * @param {Object} params
 * @param {string} params.email - Customer email address
 * @param {string} params.givenName - Customer first name
 * @param {string} [params.familyName] - Customer last name (optional)
 * @param {string} [params.phone] - Customer phone number (optional)
 * @returns {Promise<Object>} The created customer object
 */
async function createCustomer({ email, givenName, familyName = '', phone = '' }) {
  try {
    const res = await customersApi.createCustomer({
      idempotencyKey: uuid(),
      emailAddress: email,
      givenName,
      familyName,
      phoneNumber: phone
    });
    return res.result.customer;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (createCustomer):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to create customer: ${err.message}`);
  }
}

/**
 * Retrieve a customer by ID.
 * @param {string} customerId
 * @returns {Promise<Object>} The customer object
 */
async function getCustomerById(customerId) {
  try {
    const res = await customersApi.retrieveCustomer(customerId);
    return res.result.customer;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (getCustomerById):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to retrieve customer: ${err.message}`);
  }
}

/**
 * Search for customers by email.
 * @param {string} email
 * @returns {Promise<Object|null>} The first matching customer object or null
 */
async function findCustomerByEmail(email) {
  try {
    const res = await customersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: email } } }
    });
    if (res.result.customers && res.result.customers.length > 0) {
      return res.result.customers[0];
    }
    return null;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (findCustomerByEmail):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to search customer by email: ${err.message}`);
  }
}

/**
 * Update a customer's information.
 * @param {string} customerId
 * @param {Object} updates - Fields to update (emailAddress, givenName, familyName, phoneNumber, etc.)
 * @returns {Promise<Object>} The updated customer object
 */
async function updateCustomer(customerId, updates) {
  try {
    const res = await customersApi.updateCustomer(customerId, updates);
    return res.result.customer;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (updateCustomer):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to update customer: ${err.message}`);
  }
}

module.exports = {
  createCustomer,
  getCustomerById,
  findCustomerByEmail,
  updateCustomer
};