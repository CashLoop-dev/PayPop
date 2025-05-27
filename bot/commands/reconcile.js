const reconcileTransaction = require('../../paypal/flows/reconcileTransaction');

module.exports = async function reconcileConversation(conversation, ctx) {
  await ctx.reply(
    `Let's reconcile an order with PayPal transactions.\n`
  );

  await ctx.reply('Question 1:\nOrder ID to reconcile:');
  const { message: { text: orderId } } = await conversation.wait();

  try {
    const result = await reconcileTransaction(orderId);
    await ctx.reply(`Order ${result.order.id} reconciled with ${result.transactions.length} transactions.`);
  } catch (err) {
    console.error('Error in /reconcile conversation:', err);
    await ctx.reply('Failed to reconcile order. Please try again.');
  }
};
