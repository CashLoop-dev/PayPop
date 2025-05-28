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
