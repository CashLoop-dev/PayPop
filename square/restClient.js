const { SquareClient } = require('square');
const axios = require('axios').default;
require('dotenv').config();

const config = {
 // Environment: process.env.NODE_ENV === 'production' ? environment.Production : environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  userAgentDetail: "paypop_app_node"
};

const client = new SquareClient(config);
const {
  catalogApi,
  locationsApi,
  customersApi,
  subscriptionsApi,
  invoicesApi,
  paymentsApi,
  ordersApi,
  cardsApi,
  merchantsApi
} = client;

/**
 * Utility: Revert canceled subscription (clear canceled_date)
 */
const revertCanceledSubscription = async ({ subscriptionId, version }) => {
  const baseUrl = config.Environment === environment.Production
    ? "https://connect.squareup.com/v2"
    : "https://connect.squareupsandbox.com/v2";

  try {
    await axios(`${baseUrl}/subscriptions/${subscriptionId}`, {
      method: "PUT",
      data: {
        subscription: {
          version: parseInt(version),
          canceled_date: null
        }
      },
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Square-Version": "2020-11-18"
      }
    });
  } catch (error) {
    const { response } = error;
    let newError = new Error("Failed to revert canceled subscription");
    if (response && response.status) newError.status = response.status;
    if (response && response.data && response.data.errors) newError.errors = response.data.errors;
    throw newError;
  }
};

/**
 * Utility: Get location ID (first active location)
 */
const getActiveLocationId = async () => {
  try {
    const { result } = await locationsApi.listLocations();
    const active = result.locations?.find(loc => loc.status === 'ACTIVE');
    return active ? active.id : null;
  } catch (err) {
    throw new Error('Failed to fetch Square locations');
  }
};

/**
 * Utility: Get customer by email
 */
const getCustomerByEmail = async (email) => {
  try {
    const { result } = await customersApi.searchCustomers({
      query: { filter: { emailAddress: { exact: email } } }
    });
    return result.customers && result.customers.length > 0 ? result.customers[0] : null;
  } catch (err) {
    throw new Error('Failed to search customer by email');
  }
};

/**
 * Utility: Find or create customer by email
 */
const findOrCreateCustomer = async ({ email, givenName, familyName }) => {
  let customer = await getCustomerByEmail(email);
  if (customer) return customer;
  const { result } = await customersApi.createCustomer({
    emailAddress: email,
    givenName,
    familyName
  });
  return result.customer;
};

/**
 * Utility: List all active subscription plans
 */
const listActiveSubscriptionPlans = async () => {
  const { result } = await catalogApi.listCatalog(undefined, 'SUBSCRIPTION_PLAN');
  return (result.objects || []).filter(obj => obj.subscriptionPlanData && obj.presentAtAllLocations);
};

/**
 * Utility: Cancel a subscription by ID
 */
const cancelSubscription = async (subscriptionId) => {
  await subscriptionsApi.cancelSubscription(subscriptionId);
  return true;
};

/**
 * Utility: List invoices for a customer
 */
const listInvoicesByCustomer = async (customerId) => {
  const { result } = await invoicesApi.listInvoices(process.env.SQUARE_LOCATION_ID);
  return (result.invoices || []).filter(inv => inv.customerId === customerId);
};

/**
 * Utility: Create a payment
 */
const createPayment = async ({ sourceId, amount, currency = 'USD', idempotencyKey, customerId }) => {
  const { result } = await paymentsApi.createPayment({
    sourceId,
    amountMoney: { amount: Math.round(amount * 100), currency },
    idempotencyKey,
    customerId
  });
  return result.payment;
};

/**
 * Utility: Refund a payment
 */
const refundPayment = async ({ paymentId, amount, currency = 'USD', idempotencyKey }) => {
  const { result } = await paymentsApi.refundPayment({
    paymentId,
    amountMoney: { amount: Math.round(amount * 100), currency },
    idempotencyKey
  });
  return result.refund;
};

/**
 * Utility: List all locations
 */
const listAllLocations = async () => {
  const { result } = await locationsApi.listLocations();
  return result.locations || [];
};

/**
 * Utility: Get subscription by ID
 */
const getSubscriptionById = async (subscriptionId) => {
  try {
    const { result } = await subscriptionsApi.retrieveSubscription(subscriptionId);
    return result.subscription;
  } catch (err) {
    throw new Error('Failed to retrieve subscription');
  }
};

/**
 * Utility: Get invoice by ID
 */
const getInvoiceById = async (invoiceId) => {
  try {
    const { result } = await invoicesApi.getInvoice(invoiceId);
    return result.invoice;
  } catch (err) {
    throw new Error('Failed to retrieve invoice');
  }
};

module.exports = {
  client,
  catalogApi,
  locationsApi,
  customersApi,
  subscriptionsApi,
  invoicesApi,
  paymentsApi,
  ordersApi,
  cardsApi,
  merchantsApi,
  revertCanceledSubscription,
  getActiveLocationId,
  getCustomerByEmail,
  findOrCreateCustomer,
  listActiveSubscriptionPlans,
  cancelSubscription,
  listInvoicesByCustomer,
  createPayment,
  refundPayment,
  listAllLocations,
  getSubscriptionById,
  getInvoiceById
};
