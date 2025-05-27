const axios = require('axios');
const { API_BASE_URL, CLIENT_ID, CLIENT_SECRET } = process.env;

const invoiceClient = {
    createInvoice: async (invoiceData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    },

    getInvoice: async (invoiceId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/invoices/${invoiceId}`, {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error retrieving invoice: ${error.message}`);
        }
    },

    listInvoices: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/invoices`, {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error listing invoices: ${error.message}`);
        }
    },

    updateInvoice: async (invoiceId, invoiceData) => {
        try {
            const response = await axios.patch(`${API_BASE_URL}/invoices/${invoiceId}`, invoiceData, {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error updating invoice: ${error.message}`);
        }
    },

    deleteInvoice: async (invoiceId) => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/invoices/${invoiceId}`, {
                auth: {
                    username: CLIENT_ID,
                    password: CLIENT_SECRET
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Error deleting invoice: ${error.message}`);
        }
    }
};

module.exports = invoiceClient;