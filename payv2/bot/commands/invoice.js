const { InlineKeyboard } = require('grammy');
const invoiceClient = require('../../paypal/flows/invoiceClient');
const { getInvoices } = require('../../paypal/flows/invoiceClient');
const invoiceQr = require('../../paypal/flows/invoiceQr');
const fixInvoiceError = require('../../paypal/flows/fixInvoiceError');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleCreateInvoice(conversation, ctx) {
  await ctx.reply(
    `I'd be happy to help you create an invoice using PayPal (Sandbox mode).\n\n*Note:* In sandbox, use only PayPal sandbox emails for both sender and recipient.\n\nPlease provide:`
  );

  let fromEmail;
  while (true) {
    await ctx.reply('Question 1:\nYour email address (invoicer\'s email):');
    const { message: { text } } = await conversation.wait();
    if (isValidEmail(text)) {
      fromEmail = text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  let toEmail;
  while (true) {
    await ctx.reply('Question 2:\nThe recipient\'s email address:');
    const { message: { text } } = await conversation.wait();
    if (isValidEmail(text)) {
      toEmail = text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  await ctx.reply('Question 3:\nThe product or service name:');
  const { message: { text: itemName } } = await conversation.wait();

  let cost;
  while (true) {
    await ctx.reply('Question 4:\nThe cost of the product/service:');
    const { message: { text } } = await conversation.wait();
    cost = parseFloat(text);
    if (!isNaN(cost) && cost > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  let taxPercent;
  while (true) {
    await ctx.reply('Question 5:\nTax percentage (if applicable, enter 0 if none):');
    const { message: { text } } = await conversation.wait();
    taxPercent = parseFloat(text);
    if (!isNaN(taxPercent) && taxPercent >= 0) break;
    await ctx.reply('Please enter a valid number (0 or greater).');
  }

  let discountPercent;
  while (true) {
    await ctx.reply('Question 6:\nDiscount percentage (if applicable, enter 0 if none):');
    const { message: { text } } = await conversation.wait();
    discountPercent = parseFloat(text);
    if (!isNaN(discountPercent) && discountPercent >= 0) break;
    await ctx.reply('Please enter a valid number (0 or greater).');
  }

  try {
    const invoiceId = await invoiceClient({
      fromEmail,
      toEmail,
      itemName,
      cost,
      taxPercent,
      discountPercent
    });
    await ctx.reply(`Invoice ${invoiceId} sent to ${toEmail}`);
  } catch (err) {
    console.error('Error in /invoice conversation:', err?.response?.data || err);
    await ctx.reply('Failed to create or send invoice. Please check your sandbox emails and try again.');
  }
}

async function handleListInvoices(ctx) {
  try {
    const invoices = await getInvoices();
    if (!invoices || invoices.length === 0) {
      return await ctx.reply('No invoices found.');
    }
    const invoiceList = invoices
      .map(invoice => `Invoice ID: ${invoice.id}, Amount: ${invoice.amount?.value || 'N/A'}, Status: ${invoice.status}`)
      .join('\n');
    await ctx.reply(`Invoices:\n${invoiceList}`);
  } catch (error) {
    console.error('Error retrieving invoices:', error?.response?.data || error);
    await ctx.reply('An error occurred while retrieving invoices. Please try again later.');
  }
}

async function handleInvoiceQr(conversation, ctx) {
  await ctx.reply(
    `Let's create an invoice with a QR code.\n\n*Note:* In sandbox, use only PayPal sandbox emails.`
  );

  let email;
  while (true) {
    await ctx.reply('Client email:');
    const { message: { text } } = await conversation.wait();
    if (isValidEmail(text)) {
      email = text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  try {
    const result = await invoiceQr(email);
    await ctx.reply(`Invoice ${result.invoiceId} created.\nQR Code: ${result.qrUrl}`);
  } catch (err) {
    console.error('Error in invoice QR:', err?.response?.data || err);
    await ctx.reply('Failed to create invoice QR. Please check your sandbox email and try again.');
  }
}

async function handleFixInvoice(conversation, ctx) {
  await ctx.reply(
    `Let's fix an invoice by canceling the old one and sending a new one.\n`
  );

  let oldId;
  while (true) {
    await ctx.reply('Old invoice ID:');
    const { message: { text } } = await conversation.wait();
    if (text && text.trim().length > 0) {
      oldId = text.trim();
      break;
    }
    await ctx.reply('Please enter a valid invoice ID.');
  }

  let email;
  while (true) {
    await ctx.reply('Client email for new invoice:');
    const { message: { text } } = await conversation.wait();
    if (isValidEmail(text)) {
      email = text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  await ctx.reply('Product/service name for new invoice (default: Consulting):');
  const { message: { text: itemName } } = await conversation.wait();

  let quantity;
  while (true) {
    await ctx.reply('Quantity (default: 4):');
    const { message: { text } } = await conversation.wait();
    if (!text || text.trim() === '') {
      quantity = 4;
      break;
    }
    quantity = parseInt(text);
    if (!isNaN(quantity) && quantity > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  let unitAmount;
  while (true) {
    await ctx.reply('Unit amount (default: 90.00):');
    const { message: { text } } = await conversation.wait();
    if (!text || text.trim() === '') {
      unitAmount = 90.00;
      break;
    }
    unitAmount = parseFloat(text);
    if (!isNaN(unitAmount) && unitAmount > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  try {
    const newId = await fixInvoiceError(oldId, email, itemName || 'Consulting', quantity, unitAmount);
    await ctx.reply(`Old invoice ${oldId} canceled.\nNew invoice ${newId} sent.`);
  } catch (err) {
    console.error('Error in fix invoice:', err?.response?.data || err);
    await ctx.reply('Failed to fix invoice. Please check your sandbox emails and try again.');
  }
}

module.exports = async function invoiceConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Create invoice', 'create_invoice')
    .row()
    .text('List invoices', 'list_invoices')
    .row()
    .text('Invoice QR code', 'invoice_qr')
    .row()
    .text('Fix invoice', 'fix_invoice');

  const sent = await ctx.reply('What would you like to do?', { reply_markup: keyboard });

  const { callbackQuery } = await conversation.waitFor('callback_query');
  const action = callbackQuery.data;

  if (callbackQuery) {
    await ctx.api.answerCallbackQuery(callbackQuery.id);
    await ctx.api.editMessageReplyMarkup(
      callbackQuery.message.chat.id,
      callbackQuery.message.message_id
    );
  }
  await conversation.skip();

  if (action === 'create_invoice') {
    await handleCreateInvoice(conversation, ctx);
  } else if (action === 'list_invoices') {
    await handleListInvoices(ctx);
  } else if (action === 'invoice_qr') {
    await handleInvoiceQr(conversation, ctx);
  } else if (action === 'fix_invoice') {
    await handleFixInvoice(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
  }
};