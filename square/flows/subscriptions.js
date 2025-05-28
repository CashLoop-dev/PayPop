const {
  customersApi,
  catalogApi,
  subscriptionsApi
} = require('../restClient');
const { v4: uuid } = require('uuid');

/**
 * Create a Square customer.
 * @param {string} email
 * @param {string} name
 * @returns {Promise<string>} customerId
 */
async function createCustomer(email, name) {
  const [givenName, ...rest] = name.trim().split(' ');
  const familyName = rest.join(' ');
  try {
    const res = await customersApi.createCustomer({
      idempotencyKey: uuid(),
      emailAddress: email,
      givenName,
      familyName
    });
    return res.result.customer.id;
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (createCustomer):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to create customer: ${err.message}`);
  }
}

/**
 * Create a Square subscription plan and return the plan variation ID.
 * @param {string} name
 * @param {number} price
 * @returns {Promise<string>} planVariationId
 */
async function createSubscriptionPlan(name, price) {
  try {
    const tempPlanId = `#${name.replace(/\s+/g, '_').toLowerCase()}_${uuid().slice(0, 8)}`;
    const tempVariationId = `#${name.replace(/\s+/g, '_').toLowerCase()}_var_${uuid().slice(0, 8)}`;
    const catalogRes = await catalogApi.upsertCatalogObject({
      idempotencyKey: uuid(),
      object: {
        type: 'SUBSCRIPTION_PLAN',
        id: tempPlanId,
        subscriptionPlanData: {
          name,
          variations: [
            {
              type: 'SUBSCRIPTION_PLAN_VARIATION',
              id: tempVariationId,
              subscriptionPlanVariationData: {
                name: `${name} Monthly`,
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: Math.round(price * 100),
                  currency: 'USD'
                },
                cadence: 'MONTHLY'
              }
            }
          ]
        }
      }
    });

    // Find the plan variation ID from variations array
    if (
      catalogRes.result &&
      catalogRes.result.catalogObject &&
      catalogRes.result.catalogObject.subscriptionPlanData &&
      Array.isArray(catalogRes.result.catalogObject.subscriptionPlanData.variations)
    ) {
      const variation = catalogRes.result.catalogObject.subscriptionPlanData.variations[0];
      if (variation && variation.id) {
        return variation.id;
      }
    }

    // Log the full response for debugging
    console.error('Unexpected Square response (no plan variation id):', JSON.stringify(catalogRes.result, null, 2));
    throw new Error('Square API did not return a plan variation id');
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (createSubscriptionPlan):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to create subscription plan: ${err.message}`);
  }
}

/**
 * Subscribe a customer to a plan variation.
 * @param {string} customerId
 * @param {string} planVariationId
 * @returns {Promise<string>} subscriptionId
 */
async function subscribeCustomer(customerId, planVariationId) {
  if (!process.env.SQUARE_LOCATION_ID) {
    throw new Error('Missing SQUARE_LOCATION_ID environment variable.');
  }
  try {
    const res = await subscriptionsApi.createSubscription({
      idempotencyKey: uuid(),
      locationId: process.env.SQUARE_LOCATION_ID,
      customerId,
      planVariationId
    });
    if (res.result && res.result.subscription && res.result.subscription.id) {
      return res.result.subscription.id;
    } else {
      console.error('Unexpected Square response (subscribeCustomer):', JSON.stringify(res.result, null, 2));
      throw new Error('Square API did not return a subscription.id');
    }
  } catch (err) {
    if (err.errors) {
      console.error('Square API error (subscribeCustomer):', JSON.stringify(err.errors, null, 2));
    }
    throw new Error(`Failed to subscribe customer: ${err.message}`);
  }
}

module.exports = { createCustomer, createSubscriptionPlan, subscribeCustomer };
