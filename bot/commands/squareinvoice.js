const { createInvoice } = require('../../square/flows/invoices');
const { saveSquareInvoice } = require('../../db/squareInvoices');
const { logAction } = require('../../db/logs');

module.exports = async function squareInvoiceConversation(conversation, ctx) {
  // Step 1: Ask for Customer ID
  await ctx.reply('Please enter the Customer ID for the invoice:');
  const customerIdMsg = await conversation.wait();
  const customerId = customerIdMsg.message?.text?.trim();
  if (!customerId) return await ctx.reply('❌ Customer ID is required. Command cancelled.');

  // Step 2: Ask for Amount
  await ctx.reply('Enter the invoice amount (USD):');
  const amountMsg = await conversation.wait();
  const amount = parseFloat(amountMsg.message?.text?.trim());
  if (isNaN(amount) || amount <= 0) return await ctx.reply('❌ Invalid amount. Command cancelled.');

  // Step 3: Ask for Note (optional)
  await ctx.reply('Enter a note for the invoice (or type "skip" to leave blank):');
  const noteMsg = await conversation.wait();
  let note = noteMsg.message?.text?.trim();
  if (!note || note.toLowerCase() === 'skip') note = 'Service Payment';

  // Step 4: Confirm with Inline Button
  await ctx.reply(
    `Send invoice to customer ${customerId} for $${amount}?\nNote: ${note}`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm', callback_data: 'confirm_invoice' },
            { text: '❌ Cancel', callback_data: 'cancel_invoice' }
          ]
        ]
      }
    }
  );

  // Wait for button press
  const confirmCtx = await conversation.waitForCallbackQuery(['confirm_invoice', 'cancel_invoice']);
  if (confirmCtx.callbackQuery.data === 'cancel_invoice') {
    await confirmCtx.reply('Invoice creation cancelled.');
    return;
  }

  // Step 5: Create Invoice
  try {
    const invoiceId = await createInvoice(customerId, amount, note);
    await saveSquareInvoice(ctx.from.id, invoiceId, customerId, amount, note);
    await logAction(ctx.from.id, 'create', 'square_invoice', invoiceId, note);
    await confirmCtx.reply(`✅ Square invoice ${invoiceId} sent to customer ${customerId}`);
  } catch (err) {
    await confirmCtx.reply('❌ Failed to create Square invoice.\n' + (err.message || 'Unknown error.'));
    console.error(err);
  }
};
