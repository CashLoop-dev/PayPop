const axios = require('axios');
const restClient = require('../restClient');

const manageProducts = {
    createProduct: async (productData) => {
        try {
            const response = await restClient.post('/v1/catalog/products', productData);
            return response.data;
        } catch (error) {
            throw new Error(`Error creating product: ${error.message}`);
        }
    },

    updateProduct: async (productId, productData) => {
        try {
            const response = await restClient.patch(`/v1/catalog/products/${productId}`, productData);
            return response.data;
        } catch (error) {
            throw new Error(`Error updating product: ${error.message}`);
        }
    },

    deleteProduct: async (productId) => {
        try {
            const response = await restClient.delete(`/v1/catalog/products/${productId}`);
            return response.data;
        } catch (error) {
            throw new Error(`Error deleting product: ${error.message}`);
        }
    },

    listProducts: async () => {
        try {
            const response = await restClient.get('/v1/catalog/products');
            return response.data;
        } catch (error) {
            throw new Error(`Error listing products: ${error.message}`);
        }
    }
};

module.exports = manageProducts;