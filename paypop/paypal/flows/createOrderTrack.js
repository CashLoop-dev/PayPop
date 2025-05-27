const { restClient } = require('../restClient');

// Function to track an order by its ID
async function trackOrder(orderId) {
    try {
        const response = await restClient.get(`/v2/checkout/orders/${orderId}`);
        return response.data;
    } catch (error) {
        console.error('Error tracking order:', error);
        throw error;
    }
}

// Exporting the trackOrder function
module.exports = {
    trackOrder,
};