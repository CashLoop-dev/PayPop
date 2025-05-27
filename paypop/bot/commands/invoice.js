const invoiceClient = require('../../paypal/flows/invoiceClient');
const dbInvoices = require('../../db/invoices');

module.exports = {
    createInvoice: async (data) => {
        try {
            const invoice = await invoiceClient.createInvoice(data);
            await dbInvoices.saveInvoice(invoice);
            return invoice;
        } catch (error) {
            throw new Error(`Error creating invoice: ${error.message}`);
        }
    },

    updateInvoice: async (invoiceId, data) => {
        try {
            const updatedInvoice = await invoiceClient.updateInvoice(invoiceId, data);
            await dbInvoices.updateInvoice(invoiceId, updatedInvoice);
            return updatedInvoice;
        } catch (error) {
            throw new Error(`Error updating invoice: ${error.message}`);
        }
    },

    deleteInvoice: async (invoiceId) => {
        try {
            await invoiceClient.deleteInvoice(invoiceId);
            await dbInvoices.deleteInvoice(invoiceId);
        } catch (error) {
            throw new Error(`Error deleting invoice: ${error.message}`);
        }
    }
};