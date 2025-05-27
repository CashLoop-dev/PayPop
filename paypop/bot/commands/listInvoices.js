const { getInvoices } = require('../../paypal/flows/invoiceClient');

module.exports = async (ctx) => {
    try {
        const invoices = await getInvoices();
        if (invoices.length === 0) {
            ctx.reply('No invoices found.');
        } else {
            const invoiceList = invoices.map(invoice => `Invoice ID: ${invoice.id}, Amount: ${invoice.amount}, Status: ${invoice.status}`).join('\n');
            ctx.reply(`Invoices:\n${invoiceList}`);
        }
    } catch (error) {
        console.error('Error retrieving invoices:', error);
        ctx.reply('An error occurred while retrieving invoices. Please try again later.');
    }
};