#!/bin/bash

# Create Square directories and flows
mkdir -p square/flows
mkdir -p bot/commands
mkdir -p utils
mkdir -p api

# restClient.js
cat > square/restClient.js <<'EOF'
const { Client, Environment } = require('square');
function getSquareClient() {
  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: process.env.SQUARE_ENV === 'production' ? Environment.Production : Environment.Sandbox,
  });
}
module.exports = { getSquareClient };
EOF

# customer.js
cat > square/flows/customer.js <<'EOF'
const { getSquareClient } = require('../restClient');
async function createCustomer({ givenName, familyName, email, phone }) {
  const client = getSquareClient();
  const { result } = await client.customersApi.createCustomer({
    givenName,
    familyName,
    emailAddress: email,
    phoneNumber: phone,
  });
  return result.customer;
}
async function listCustomers() {
  const client = getSquareClient();
  const { result } = await client.customersApi.listCustomers();
  return result.customers || [];
}
async function getCustomer(customerId) {
  const client = getSquareClient();
  const { result } = await client.customersApi.retrieveCustomer(customerId);
  return result.customer;
}
async function updateCustomer(customerId, updates) {
  const client = getSquareClient();
  const { result } = await client.customersApi.updateCustomer(customerId, updates);
  return result.customer;
}
async function deleteCustomer(customerId) {
  const client = getSquareClient();
  await client.customersApi.deleteCustomer(customerId);
  return true;
}
module.exports = {
  createCustomer,
  listCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
};
EOF

# order.js
cat > square/flows/order.js <<'EOF'
const { getSquareClient } = require('../restClient');
async function createOrder(lineItems) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.createOrder({
    order: {
      locationId: process.env.SQUARE_LOCATION_ID,
      lineItems,
    }
  });
  return result.order;
}
async function listOrders() {
  const client = getSquareClient();
  const { result } = await client.ordersApi.searchOrders({
    locationIds: [process.env.SQUARE_LOCATION_ID],
  });
  return (result.orders || []);
}
async function getOrder(orderId) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.retrieveOrder(orderId);
  return result.order;
}
async function updateOrder(orderId, updates) {
  const client = getSquareClient();
  const { result } = await client.ordersApi.updateOrder(orderId, updates);
  return result.order;
}
module.exports = {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
};
EOF

# invoice.js
cat > square/flows/invoice.js <<'EOF'
const { getSquareClient } = require('../restClient');
async function createInvoice({ customerId, orderId, dueDate, title, description }) {
  const client = getSquareClient();
  const { result } = await client.invoicesApi.createInvoice({
    invoice: {
      locationId: process.env.SQUARE_LOCATION_ID,
      orderId,
      primaryRecipient: { customerId },
      title,
      description,
      paymentRequests: [{
        requestType: 'BALANCE',
        dueDate,
      }],
      deliveryMethod: 'EMAIL',
    }
  });
  return result.invoice;
}
async function listInvoices() {
  const client = getSquareClient();
  const { result } = await client.invoicesApi.listInvoices(process.env.SQUARE_LOCATION_ID);
  return result.invoices || [];
}
async function sendInvoice(invoiceId, version) {
  const client = getSquareClient();
  const { result } = await client.invoicesApi.publishInvoice(invoiceId, {
    version,
    idempotencyKey: Date.now().toString(),
  });
  return result.invoice;
}
async function getInvoice(invoiceId) {
  const client = getSquareClient();
  const { result } = await client.invoicesApi.getInvoice(invoiceId);
  return result.invoice;
}
async function cancelInvoice(invoiceId, version) {
  const client = getSquareClient();
  const { result } = await client.invoicesApi.cancelInvoice(invoiceId, { version });
  return result.invoice;
}
async function deleteInvoice(invoiceId, version) {
  const client = getSquareClient();
  await client.invoicesApi.deleteInvoice(invoiceId, { version });
  return true;
}
module.exports = {
  createInvoice,
  listInvoices,
  sendInvoice,
  getInvoice,
  cancelInvoice,
  deleteInvoice,
};
EOF

# payment.js
cat > square/flows/payment.js <<'EOF'
const { getSquareClient } = require('../restClient');
async function refundPayment(paymentId, amount, currency = 'USD') {
  const client = getSquareClient();
  const { result } = await client.refundsApi.refundPayment({
    idempotencyKey: Date.now().toString(),
    paymentId,
    amountMoney: {
      amount: Math.round(amount * 100),
      currency,
    },
  });
  return result.refund;
}
async function createPaymentLink(amount, currency = 'USD') {
  const client = getSquareClient();
  const { result } = await client.checkoutApi.createPaymentLink({
    idempotencyKey: Date.now().toString(),
    quickPay: {
      name: 'PayPop Payment',
      priceMoney: {
        amount: Math.round(amount * 100),
        currency,
      },
    },
  });
  return result.paymentLink;
}
async function getPayment(paymentId) {
  const client = getSquareClient();
  const { result } = await client.paymentsApi.getPayment(paymentId);
  return result.payment;
}
async function listPayments() {
  const client = getSquareClient();
  const { result } = await client.paymentsApi.listPayments();
  return result.payments || [];
}
module.exports = {
  refundPayment,
  createPaymentLink,
  getPayment,
  listPayments,
};
EOF

# subscription.js
cat > square/flows/subscription.js <<'EOF'
const { getSquareClient } = require('../restClient');
async function createSubscription({ customerId, planId, startDate }) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.createSubscription({
    idempotencyKey: Date.now().toString(),
    locationId: process.env.SQUARE_LOCATION_ID,
    planId,
    customerId,
    startDate,
  });
  return result.subscription;
}
async function listSubscriptions() {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.searchSubscriptions({
    locationIds: [process.env.SQUARE_LOCATION_ID],
  });
  return result.subscriptions || [];
}
async function getSubscription(subscriptionId) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.retrieveSubscription(subscriptionId);
  return result.subscription;
}
async function cancelSubscription(subscriptionId) {
  const client = getSquareClient();
  const { result } = await client.subscriptionsApi.cancelSubscription(subscriptionId);
  return result.subscription;
}
module.exports = {
  createSubscription,
  listSubscriptions,
  getSubscription,
  cancelSubscription,
};
EOF

# webhook.js
cat > square/flows/webhook.js <<'EOF'
const crypto = require('crypto');
function verifySquareWebhook(signatureKey, body, signatureHeader, notificationUrl) {
  const hmac = crypto.createHmac('sha1', signatureKey);
  hmac.update(notificationUrl + body);
  const hash = hmac.digest('base64');
  return hash === signatureHeader;
}
function squareWebhookHandler(signatureKey, notificationUrl) {
  return (req, res, next) => {
    const signature = req.headers['x-square-signature'];
    const rawBody = req.rawBody || JSON.stringify(req.body);
    if (!verifySquareWebhook(signatureKey, rawBody, signature, notificationUrl)) {
      return res.status(401).send('Invalid signature');
    }
    next();
  };
}
module.exports = {
  verifySquareWebhook,
  squareWebhookHandler,
};
EOF

# convoCancel.js
cat > utils/convoCancel.js <<'EOF'
async function waitOrCancel(conversation, ctx, prompt) {
  await ctx.reply(prompt);
  const { message } = await conversation.wait();
  if (message && message.text && message.text.trim().toLowerCase() === '/cancel') {
    await ctx.reply('Operation cancelled.');
    throw new Error('cancelled');
  }
  return message;
}
module.exports = waitOrCancel;
EOF

echo "✅ Square integration files and folders created!"
