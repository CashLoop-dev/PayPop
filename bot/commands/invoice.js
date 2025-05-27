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
    const { message } = await conversation.wait();
    if (message && isValidEmail(message.text)) {
      fromEmail = message.text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  let toEmail;
  while (true) {
    await ctx.reply('Question 2:\nThe recipient\'s email address:');
    const { message } = await conversation.wait();
    if (message && isValidEmail(message.text)) {
      toEmail = message.text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  await ctx.reply('Question 3:\nThe product or service name:');
  const { message: { text: itemName } } = await conversation.wait();

  let cost;
  while (true) {
    await ctx.reply('Question 4:\nThe cost of the product/service:');
    const { message } = await conversation.wait();
    if (message) {
      cost = parseFloat(message.text);
      if (!isNaN(cost) && cost > 0) break;
    }
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  let taxPercent;
  while (true) {
    await ctx.reply('Question 5:\nTax percentage (if applicable, enter 0 if none):');
    const { message } = await conversation.wait();
    if (message) {
      taxPercent = parseFloat(message.text);
      if (!isNaN(taxPercent) && taxPercent >= 0) break;
    }
    await ctx.reply('Please enter a valid number (0 or greater).');
  }

  let discountPercent;
  while (true) {
    await ctx.reply('Question 6:\nDiscount percentage (if applicable, enter 0 if none):');
    const { message } = await conversation.wait();
    if (message) {
      discountPercent = parseFloat(message.text);
      if (!isNaN(discountPercent) && discountPercent >= 0) break;
    }
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
  await conversation.exit();
}

async function handleListInvoices(conversation, ctx) {
  try {
    const invoices = await getInvoices();
    if (!invoices || invoices.length === 0) {
      await ctx.reply('No invoices found.');
      await conversation.exit();
      return;
    }
    const invoiceList = invoices
      .map(invoice => `Invoice ID: ${invoice.id}, Amount: ${invoice.amount?.value || 'N/A'}, Status: ${invoice.status}`)
      .join('\n');
    await ctx.reply(`Invoices:\n${invoiceList}`);
  } catch (error) {
    console.error('Error retrieving invoices:', error?.response?.data || error);
    await ctx.reply('An error occurred while retrieving invoices. Please try again later.');
  }
  await conversation.exit();
}

async function handleInvoiceQr(conversation, ctx) {
  await ctx.reply(
    `Let's create an invoice with a QR code.\n\n*Note:* In sandbox, use only PayPal sandbox emails.`
  );

  let email;
  while (true) {
    await ctx.reply('Client email:');
    const { message } = await conversation.wait();
    if (message && isValidEmail(message.text)) {
      email = message.text;
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
  await conversation.exit();
}

async function handleFixInvoice(conversation, ctx) {
  await ctx.reply(
    `Let's fix an invoice by canceling the old one and sending a new one.\n`
  );

  let oldId;
  while (true) {
    await ctx.reply('Old invoice ID:');
    const { message } = await conversation.wait();
    if (message && message.text && message.text.trim().length > 0) {
      oldId = message.text.trim();
      break;
    }
    await ctx.reply('Please enter a valid invoice ID.');
  }

  let email;
  while (true) {
    await ctx.reply('Client email for new invoice:');
    const { message } = await conversation.wait();
    if (message && isValidEmail(message.text)) {
      email = message.text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  await ctx.reply('Product/service name for new invoice (default: Consulting):');
  const { message } = await conversation.wait();
  const itemName = message?.text || 'Consulting';

  let quantity;
  while (true) {
    await ctx.reply('Quantity (default: 4):');
    const { message } = await conversation.wait();
    if (!message || !message.text || message.text.trim() === '') {
      quantity = 4;
      break;
    }
    quantity = parseInt(message.text);
    if (!isNaN(quantity) && quantity > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  let unitAmount;
  while (true) {
    await ctx.reply('Unit amount (default: 90.00):');
    const { message } = await conversation.wait();
    if (!message || !message.text || message.text.trim() === '') {
      unitAmount = 90.00;
      break;
    }
    unitAmount = parseFloat(message.text);
    if (!isNaN(unitAmount) && unitAmount > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  try {
    const newId = await fixInvoiceError(oldId, email, itemName, quantity, unitAmount);
    await ctx.reply(`Old invoice ${oldId} canceled.\nNew invoice ${newId} sent.`);
  } catch (err) {
    console.error('Error in fix invoice:', err?.response?.data || err);
    await ctx.reply('Failed to fix invoice. Please check your sandbox emails and try again.');
  }
  await conversation.exit();
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

  await ctx.reply('What would you like to do?', { reply_markup: keyboard });

  let callbackQueryData = null;
  while (!callbackQueryData) {
    const update = await conversation.wait();
    if (update.callbackQuery && update.callbackQuery.data) {
      callbackQueryData = update.callbackQuery.data;
      await ctx.api.answerCallbackQuery(update.callbackQuery.id);
      await ctx.api.editMessageReplyMarkup(
        update.callbackQuery.message.chat.id,
        update.callbackQuery.message.message_id,
        undefined
      );
      break;
    } else {
      await ctx.reply('Please choose an option using the buttons above.');
    }
  }

  if (callbackQueryData === 'create_invoice') {
    await handleCreateInvoice(conversation, ctx);
  } else if (callbackQueryData === 'list_invoices') {
    await handleListInvoices(conversation, ctx);
  } else if (callbackQueryData === 'invoice_qr') {
    await handleInvoiceQr(conversation, ctx);
  } else if (callbackQueryData === 'fix_invoice') {
    await handleFixInvoice(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
    await conversation.exit();
  }
};