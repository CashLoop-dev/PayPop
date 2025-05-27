const db = require('./connection');

// Function to create a new invoice
const createInvoice = async (invoiceData) => {
    try {
        const newInvoice = await db.Invoices.create(invoiceData);
        return newInvoice;
    } catch (error) {
        throw new Error('Error creating invoice: ' + error.message);
    }
};

// Function to retrieve an invoice by ID
const getInvoiceById = async (invoiceId) => {
    try {
        const invoice = await db.Invoices.findById(invoiceId);
        return invoice;
    } catch (error) {
        throw new Error('Error retrieving invoice: ' + error.message);
    }
};

// Function to update an existing invoice
const updateInvoice = async (invoiceId, updateData) => {
    try {
        const updatedInvoice = await db.Invoices.findByIdAndUpdate(invoiceId, updateData, { new: true });
        return updatedInvoice;
    } catch (error) {
        throw new Error('Error updating invoice: ' + error.message);
    }
};

// Function to delete an invoice
const deleteInvoice = async (invoiceId) => {
    try {
        await db.Invoices.findByIdAndDelete(invoiceId);
        return { message: 'Invoice deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting invoice: ' + error.message);
    }
};

// Function to list all invoices
const listInvoices = async () => {
    try {
        const invoices = await db.Invoices.find();
        return invoices;
    } catch (error) {
        throw new Error('Error listing invoices: ' + error.message);
    }
};

module.exports = {
    createInvoice,
    getInvoiceById,
    updateInvoice,
    deleteInvoice,
    listInvoices
};