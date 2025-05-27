const restClient = require('../restClient');

async function cancelSubscription(subscriptionId) {
    try {
        const response = await restClient.post(`/v1/billing/subscriptions/${subscriptionId}/cancel`);
        return response.data;
    } catch (error) {
        throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
}

module.exports = {
    cancelSubscription
};