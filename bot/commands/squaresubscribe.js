const {
  createCustomer,
  createSubscriptionPlan,
  subscribeCustomer
} = require('../../square/flows/subscriptions');
const { saveSquareSubscription } = require('../../db/squareSubscriptions');
const { logAction } = require('../../db/logs');

module.exports = async function squareSubscribeConversation(conversation, ctx) {
  // Step 1: Ask for Name
  await ctx.reply('Please enter the customer\'s full name:');
  const nameMsg = await conversation.wait();
  const name = nameMsg.message?.text?.trim();
  if (!name) return await ctx.reply('❌ Name is required. Command cancelled.');

  // Step 2: Ask for Email
  await ctx.reply('Enter the customer\'s email address:');
  const emailMsg = await conversation.wait();
  const email = emailMsg.message?.text?.trim();
  if (!email || !email.includes('@')) return await ctx.reply('❌ Valid email is required. Command cancelled.');

  // Step 3: Ask for Plan Name
  await ctx.reply('Enter the subscription plan name:');
  const planNameMsg = await conversation.wait();
  const planName = planNameMsg.message?.text?.trim();
  if (!planName) return await ctx.reply('❌ Plan name is required. Command cancelled.');

  // Step 4: Ask for Price
  await ctx.reply('Enter the monthly price (USD):');
  const priceMsg = await conversation.wait();
  const price = parseFloat(priceMsg.message?.text?.trim());
  if (isNaN(price) || price <= 0) return await ctx.reply('❌ Invalid price. Command cancelled.');

  // Step 5: Confirm with Inline Button
  await ctx.reply(
    `Create subscription for ${name} (${email})\nPlan: ${planName}\nPrice: $${price}/month?`,
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Confirm', callback_data: 'confirm_subscribe' },
            { text: '❌ Cancel', callback_data: 'cancel_subscribe' }
          ]
        ]
      }
    }
  );

  const confirmCtx = await conversation.waitForCallbackQuery(['confirm_subscribe', 'cancel_subscribe']);
  if (confirmCtx.callbackQuery.data === 'cancel_subscribe') {
    await confirmCtx.reply('Subscription creation cancelled.');
    return;
  }

  // Step 6: Create Subscription
  try {
    const customerId = await createCustomer(email, name);
    const planVariationId = await createSubscriptionPlan(planName, price);
    const subId = await subscribeCustomer(customerId, planVariationId);

    await saveSquareSubscription(ctx.from.id, subId, customerId, email, planName);
    await logAction(ctx.from.id, 'subscribe', 'square_subscription', subId, planName);
    await confirmCtx.reply(`✅ Square subscription created: ${subId} for ${name}`);
  } catch (err) {
    await confirmCtx.reply('❌ Failed to subscribe.\n' + (err.message || 'Unknown error.'));
    console.error(err);
  }
};
