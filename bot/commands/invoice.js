const { InlineKeyboard } = require('grammy');
const invoiceClient = require('../../paypal/flows/invoiceClient');
const { getInvoices } = require('../../paypal/flows/invoiceClient');
const invoiceQr = require('../../paypal/flows/invoiceQr');
const fixInvoiceError = require('../../paypal/flows/fixInvoiceError');
const waitOrCancel = require('../../utils/convoCancel');
const { getUserSettings, saveUserSetting } = require('../../db/userSettings');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleCreateInvoice(conversation, ctx) {
  const userSettings = getUserSettings(ctx.from.id);

  await ctx.reply(
    `I'd be happy to help you create an invoice using PayPal (Sandbox mode).\n\n*Note:* In sandbox, use only PayPal sandbox emails for both sender and recipient.\n\n*Type /cancel at any time to stop.*\n\nPlease provide:`
  );

  let fromEmail;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 1:\nYour email address (invoicer\'s email):');
      if (message && isValidEmail(message.text)) {
        fromEmail = message.text;
        break;
      }
      await ctx.reply('Invalid email. Please enter a valid email address.');
    } catch (e) { return; }
  }

  let toEmail;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 2:\nThe recipient\'s email address:');
      if (message && isValidEmail(message.text)) {
        toEmail = message.text;
        break;
      }
      await ctx.reply('Invalid email. Please enter a valid email address.');
    } catch (e) { return; }
  }

  let itemName;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Question 3:\nThe product or service name:');
    itemName = message.text;
  } catch (e) { return; }

  let cost;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 4:\nThe cost of the product/service:');
      if (message) {
        cost = parseFloat(message.text);
        if (!isNaN(cost) && cost > 0) break;
      }
      await ctx.reply('Please enter a valid number greater than 0.');
    } catch (e) { return; }
  }

  let taxPercent;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 5:\nTax percentage (if applicable, enter 0 if none):');
      if (message) {
        taxPercent = parseFloat(message.text);
        if (!isNaN(taxPercent) && taxPercent >= 0) break;
      }
      await ctx.reply('Please enter a valid number (0 or greater).');
    } catch (e) { return; }
  }

  let discountPercent;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 6:\nDiscount percentage (if applicable, enter 0 if none):');
      if (message) {
        discountPercent = parseFloat(message.text);
        if (!isNaN(discountPercent) && discountPercent >= 0) break;
      }
      await ctx.reply('Please enter a valid number (0 or greater).');
    } catch (e) { return; }
  }

  try {
    const invoiceId = await invoiceClient({
      fromEmail,
      toEmail,
      itemName,
      cost,
      taxPercent,
      discountPercent,
      logoUrl: userSettings.invoiceLogoUrl,
      defaultTerms: userSettings.invoiceDefaultTerms
    });
    await ctx.reply(`Invoice ${invoiceId} sent to ${toEmail}`);
  } catch (err) {
    console.error('Error in /invoice conversation:', err?.response?.data || err);
    await ctx.reply('Failed to create or send invoice. Please check your sandbox emails and try again.');
  }
  return;
}

async function handleSetInvoiceLogo(conversation, ctx) {
  await ctx.reply('Please send the URL of your logo image:');
  try {
    const message = await waitOrCancel(conversation, ctx, 'Logo URL:');
    saveUserSetting(ctx.from.id, 'invoiceLogoUrl', message.text);
    await ctx.reply('Logo URL saved!');
  } catch (e) { return; }
  return;
}

async function handleSetInvoiceTerms(conversation, ctx) {
  await ctx.reply('Please enter your default invoice terms:');
  try {
    const message = await waitOrCancel(conversation, ctx, 'Default terms:');
    saveUserSetting(ctx.from.id, 'invoiceDefaultTerms', message.text);
    await ctx.reply('Default terms saved!');
  } catch (e) { return; }
  return;
}

async function handleListInvoices(conversation, ctx) {
  try {
    const invoices = await getInvoices();
    if (!invoices || invoices.length === 0) {
      await ctx.reply('No invoices found.');
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
  return;
}

async function handleInvoiceQr(conversation, ctx) {
  await ctx.reply(
    `Let's create an invoice with a QR code.\n\n*Note:* In sandbox, use only PayPal sandbox emails.\n\n*Type /cancel at any time to stop.*`
  );

  let email;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Client email:');
      if (message && isValidEmail(message.text)) {
        email = message.text;
        break;
      }
      await ctx.reply('Invalid email. Please enter a valid email address.');
    } catch (e) { return; }
  }

  try {
    const result = await invoiceQr(email);
    await ctx.reply(`Invoice ${result.invoiceId} created.\nQR Code: ${result.qrUrl}`);
  } catch (err) {
    console.error('Error in invoice QR:', err?.response?.data || err);
    await ctx.reply('Failed to create invoice QR. Please check your sandbox email and try again.');
  }
  return;
}

async function handleFixInvoice(conversation, ctx) {
  await ctx.reply(
    `Let's fix an invoice by canceling the old one and sending a new one.\n\n*Type /cancel at any time to stop.*`
  );

  let oldId;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Old invoice ID:');
      if (message && message.text && message.text.trim().length > 0) {
        oldId = message.text.trim();
        break;
      }
      await ctx.reply('Please enter a valid invoice ID.');
    } catch (e) { return; }
  }

  let email;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Client email for new invoice:');
      if (message && isValidEmail(message.text)) {
        email = message.text;
        break;
      }
      await ctx.reply('Invalid email. Please enter a valid email address.');
    } catch (e) { return; }
  }

  let itemName;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Product/service name for new invoice (default: Consulting):');
    itemName = message?.text || 'Consulting';
  } catch (e) { return; }

  let quantity;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Quantity (default: 4):');
      if (!message || !message.text || message.text.trim() === '') {
        quantity = 4;
        break;
      }
      quantity = parseInt(message.text);
      if (!isNaN(quantity) && quantity > 0) break;
      await ctx.reply('Please enter a valid number greater than 0.');
    } catch (e) { return; }
  }

  let unitAmount;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Unit amount (default: 90.00):');
      if (!message || !message.text || message.text.trim() === '') {
        unitAmount = 90.00;
        break;
      }
      unitAmount = parseFloat(message.text);
      if (!isNaN(unitAmount) && unitAmount > 0) break;
      await ctx.reply('Please enter a valid number greater than 0.');
    } catch (e) { return; }
  }

  try {
    const newId = await fixInvoiceError(oldId, email, itemName, quantity, unitAmount);
    await ctx.reply(`Old invoice ${oldId} canceled.\nNew invoice ${newId} sent.`);
  } catch (err) {
    console.error('Error in fix invoice:', err?.response?.data || err);
    await ctx.reply('Failed to fix invoice. Please check your sandbox emails and try again.');
  }
  return;
}

module.exports = async function invoiceConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Create invoice', 'create_invoice')
    .row()
    .text('List invoices', 'list_invoices')
    .row()
    .text('Invoice QR code', 'invoice_qr')
    .row()
    .text('Fix invoice', 'fix_invoice')
    .row()
    .text('Set logo', 'set_logo')
    .row()
    .text('Set default terms', 'set_terms');

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
  } else if (callbackQueryData === 'set_logo') {
    await handleSetInvoiceLogo(conversation, ctx);
  } else if (callbackQueryData === 'set_terms') {
    await handleSetInvoiceTerms(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
  }
  return;
};