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
