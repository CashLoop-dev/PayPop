const { listSquareInvoicesByUser } = require('../../db/squareInvoices');
const { listSquareSubscriptionsByUser } = require('../../db/squareSubscriptions');

module.exports = async function squareHistoryConversation(conversation, ctx) {
  const userId = ctx.from.id;
  try {
    const invoices = await listSquareInvoicesByUser(userId);
    const subs = await listSquareSubscriptionsByUser(userId);

    const lines = invoices.map(i => `• ${i.id} - $${i.amount} - ${i.status}`);
    const total = invoices.reduce((sum, i) => sum + i.amount, 0).toFixed(2);

    const buttons = subs.map(s => [
      { text: `Cancel ${s.plan_name}`, callback_data: `cancel_square_${s.id}` }
    ]);

    await ctx.reply(
      `== Square Invoices ==\n${lines.join('\n')}\n\n💵 Total Revenue: $${total}`,
      { reply_markup: { inline_keyboard: buttons } }
    );

    // Optionally, handle inline cancel button presses here if you want to process them in this conversation
    // Otherwise, handle them in a separate callback query handler
  } catch (err) {
    await ctx.reply('❌ Failed to fetch Square history.');
    console.error(err);
  }
};
