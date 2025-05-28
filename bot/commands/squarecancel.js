const client = require('../../square/restClient');
const { updateSquareSubscriptionStatus } = require('../../db/squareSubscriptions');
const { logAction } = require('../../db/logs');

module.exports = async function squareCancelConversation(conversation, ctx) {
  // Step 1: Ask for Subscription ID
  await ctx.reply('Please enter the Subscription ID to cancel:');
  const subIdMsg = await conversation.wait();
  const subId = subIdMsg.message?.text?.trim();
  if (!subId) return await ctx.reply('❌ Subscription ID is required. Command cancelled.');

  // Step 2: Confirm with Inline Button
  await ctx.reply(
    `Are you sure you want to cancel subscription ${subId}?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Yes, cancel', callback_data: 'confirm_cancel' },
            { text: '❌ No', callback_data: 'cancel_cancel' }
          ]
        ]
      }
    }
  );

  const confirmCtx = await conversation.waitForCallbackQuery(['confirm_cancel', 'cancel_cancel']);
  if (confirmCtx.callbackQuery.data === 'cancel_cancel') {
    await confirmCtx.reply('Cancellation aborted.');
    return;
  }

  // Step 3: Cancel Subscription
  try {
    await client.post(`/v2/subscriptions/${subId}/cancel`);
    await updateSquareSubscriptionStatus(subId, 'CANCELED');
    await logAction(ctx.from.id, 'cancel', 'square_subscription', subId);
    await confirmCtx.reply(`✅ Subscription ${subId} cancelled.`);
  } catch (err) {
    await confirmCtx.reply('❌ Failed to cancel subscription.');
    console.error(err);
  }
};
