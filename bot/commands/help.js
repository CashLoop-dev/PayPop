module.exports = async function help(ctx) {
  await ctx.reply(
`🤖 *PayPop Bot Help*

Here are the available commands and what they do:

*💸 Invoicing*
/invoice – Create and send an invoice interactively
/fixinvoice – Cancel an old invoice and send a corrected one
/invoiceqr – Create an invoice and get a QR code for payment
/listInvoices – List all invoices

*🛒 Orders & Products*
/order – Create, pay for, and track an order interactively
/products – Add or fetch product details
/listOrders – List all orders

*🔄 Subscriptions*
/subscribe – Create a new subscription interactively
/cancelsub – Cancel an existing subscription

*💼 Reconciliation & Disputes*
/reconcile – Reconcile an order with PayPal transactions
/disputes – Resolve open PayPal disputes

*❓ Other*
/help – Show this help message

_Just type any command to get started. The bot will guide you through each step!_`
  , { parse_mode: "Markdown" });
};
