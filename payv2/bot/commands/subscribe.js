const { InlineKeyboard } = require('grammy');
const createSubscription = require('../../paypal/flows/createSubscription');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleCreateSubscription(conversation, ctx) {
  await ctx.reply(`Let's create a new subscription. Please provide:`);

  await ctx.reply('Question 1:\nSubscriber name:');
  const { message: { text: name } } = await conversation.wait();

  let email;
  while (true) {
    await ctx.reply('Question 2:\nSubscriber email:');
    const { message: { text } } = await conversation.wait();
    if (isValidEmail(text)) {
      email = text;
      break;
    }
    await ctx.reply('Invalid email. Please enter a valid email address.');
  }

  try {
    const subId = await createSubscription(email, name);
    await ctx.reply(`Subscription ${subId} created for ${name}`);
  } catch (err) {
    console.error('Error in /subscribe conversation:', err?.response?.data || err);
    await ctx.reply('Failed to create subscription. Please try again.');
  }
  await conversation.exit();
}

module.exports = async function subscribeConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Create subscription', 'create_subscription');

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

  if (callbackQueryData === 'create_subscription') {
    await handleCreateSubscription(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
    await conversation.exit();
  }
};