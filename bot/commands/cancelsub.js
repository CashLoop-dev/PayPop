const cancelSubscription = require('../../paypal/flows/cancelSubscription');

module.exports = async function cancelsubConversation(conversation, ctx) {
  await ctx.reply(
    `Let's cancel a subscription.\n`
  );

  await ctx.reply('Question 1:\nSubscription ID to cancel:');
  const { message: { text: subId } } = await conversation.wait();

  try {
    const sub = await cancelSubscription(subId);
    if (!sub) return await ctx.reply('Subscription not found or already canceled.');
    await ctx.reply(`Subscription ${sub.id} canceled for ${sub.subscriber.email_address}`);
  } catch (err) {
    console.error('Error in /cancelsub conversation:', err);
    await ctx.reply('Failed to cancel subscription. Please try again.');
  }
};
