const reconcileTransaction = require('../../paypal/flows/reconcileTransaction');
const waitOrCancel = require('../../utils/convoCancel');

module.exports = async function reconcileConversation(conversation, ctx) {
  await ctx.reply(
    `Let's reconcile an order with PayPal transactions.\n*Type /cancel at any time to stop.*`
  );

  let orderId;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Question 1:\nOrder ID to reconcile:');
    orderId = message.text;
  } catch (e) { return; }

  try {
    const result = await reconcileTransaction(orderId);
    await ctx.reply(`Order ${result.order.id} reconciled with ${result.transactions.length} transactions.`);
  } catch (err) {
    console.error('Error in /reconcile conversation:', err);
    await ctx.reply('Failed to reconcile order. Please try again.');
  }
  return;
};
