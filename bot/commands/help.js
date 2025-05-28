module.exports = async function help(ctx) {
  await ctx.reply(
`🤖 *PayPop Bot Help*

Here are the available commands and their usage:

*💸 Invoicing*
/invoice — Create and send an invoice interactively
/listinvoices — List all invoices
/invoiceqr — Create an invoice and get a QR code for payment
/fixinvoice — Cancel an old invoice and send a corrected one
/set_logo — Set a custom logo for your invoices
/set_terms — Set default terms for your invoices

*🛒 Orders & Products*
/order — Create, pay for, and track an order interactively
/products — Add, fetch, list, or delete product details
/listorders — List all orders

*🔄 Subscriptions*
/subscribe — Create, list, or delete a subscription interactively

*💼 Reconciliation & Disputes*
/reconcile — Reconcile an order with PayPal transactions
/disputes — Resolve open PayPal disputes

*📊 Admin & Analytics*
/admin — Admin dashboard: view stats, export sales, invoices, and subscriptions as CSV or PDF

*❓ Other*
/help — Show this help message

_Tip: Use the inline buttons for each command to access more options and features!_
_Just type any command to get started. The bot will guide you through each step._`
  , { parse_mode: "Markdown" });
};
