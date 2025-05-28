const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const stream = require('stream');

function exportToCSV({ invoices, orders, subscriptions }) {
  const parser = new Parser();
  const csvInvoices = parser.parse(invoices);
  const csvOrders = parser.parse(orders);
  const csvSubs = parser.parse(subscriptions);

  return Buffer.from(
    `Invoices\n${csvInvoices}\n\nOrders\n${csvOrders}\n\nSubscriptions\n${csvSubs}\n`
  );
}

async function exportToPDF({ invoices, orders, subscriptions }) {
  const doc = new PDFDocument();
  const bufferStream = new stream.PassThrough();
  doc.pipe(bufferStream);

  doc.fontSize(18).text('Admin Dashboard Export', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text('Invoices');
  invoices.forEach(inv => doc.text(JSON.stringify(inv)));
  doc.moveDown();

  doc.fontSize(14).text('Orders');
  orders.forEach(order => doc.text(JSON.stringify(order)));
  doc.moveDown();

  doc.fontSize(14).text('Subscriptions');
  subscriptions.forEach(sub => doc.text(JSON.stringify(sub)));
  doc.end();

  const buffers = [];
  for await (const chunk of bufferStream) {
    buffers.push(chunk);
  }
  return Buffer.concat(buffers);
}

module.exports = { exportToCSV, exportToPDF };