module.exports = async function help(ctx) {
  await ctx.reply(
`🤖 <b>PayPop Bot Help</b>

Here are the available commands and their usage:

<b>💸 PayPal Invoicing</b>
/invoice — Create and send a PayPal invoice interactively
/listinvoices — List all PayPal invoices
/invoiceqr — Create a PayPal invoice and get a QR code for payment
/fixinvoice — Cancel an old PayPal invoice and send a corrected one
/set_logo — Set a custom logo for your invoices
/set_terms — Set default terms for your invoices

<b>🛒 Orders & Products</b>
/order — Create, pay for, and track an order interactively
/products — Add, fetch, list, or delete product details
/listorders — List all orders

<b>🔄 PayPal Subscriptions</b>
/subscribe — Create, list, or delete a PayPal subscription interactively

<b>💼 Reconciliation & Disputes</b>
/reconcile — Reconcile an order with PayPal transactions
/disputes — Resolve open PayPal disputes

<b>📊 Admin & Analytics</b>
/admin — Admin dashboard: view stats, export sales, invoices, and subscriptions as CSV or PDF

<b>💳 Square Integration</b>
/square_invoice — Create and send a Square invoice interactively
/square_subscribe — Create a Square subscription interactively
/square_cancel — Cancel a Square subscription interactively
/square_history — View your Square invoices and subscriptions
/square_export — Export your Square invoices and subscriptions as CSV/JSON

<b>❓ Other</b>
/help — Show this help message

<i>Tip: Use the inline buttons for each command to access more options and features!
Just type any command to get started. The bot will guide you through each step.</i>`
  , { parse_mode: "HTML" });
};
