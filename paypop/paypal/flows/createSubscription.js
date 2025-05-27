const restClient = require('../restClient');

async function createSubscription(subscriptionData) {
    try {
        const response = await restClient.post('/v1/billing/subscriptions', subscriptionData);
        return response.data;
    } catch (error) {
        throw new Error(`Error creating subscription: ${error.message}`);
    }
}

module.exports = {
    createSubscription,
};