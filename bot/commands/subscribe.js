const { InlineKeyboard } = require('grammy');
const {
  createSubscription,
  listSubscriptions,
  deleteSubscription
} = require('../../paypal/flows/createSubscription');
const waitOrCancel = require('../../utils/convoCancel');

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function handleCreateSubscription(conversation, ctx) {
  await ctx.reply(`Let's create a new subscription. *Type /cancel at any time to stop.*\nPlease provide:`);

  let name;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Question 1:\nSubscriber name:');
    name = message.text;
  } catch (e) { return; }

  let email;
  while (true) {
    try {
      const message = await waitOrCancel(conversation, ctx, 'Question 2:\nSubscriber email:');
      if (isValidEmail(message.text)) {
        email = message.text;
        break;
      }
      await ctx.reply('Invalid email. Please enter a valid email address.');
    } catch (e) { return; }
  }

  try {
    const subId = await createSubscription(email, name);
    await ctx.reply(`Subscription ${subId} created for ${name}`);
  } catch (err) {
    console.error('Error in /subscribe conversation:', err?.response?.data || err);
    await ctx.reply('Failed to create subscription. Please try again.');
  }
  return;
}

async function handleListSubscriptions(conversation, ctx) {
  try {
    const subs = await listSubscriptions();
    if (!subs || subs.length === 0) {
      await ctx.reply('No subscriptions found.');
      return;
    }
    const subList = subs
      .map(sub => `ID: ${sub.id}, Email: ${sub.email || 'N/A'}, Name: ${sub.name || 'N/A'}, Status: ${sub.status || 'N/A'}`)
      .join('\n');
    await ctx.reply(`Subscriptions:\n${subList}`);
  } catch (error) {
    console.error('Error retrieving subscriptions:', error?.response?.data || error);
    await ctx.reply('An error occurred while retrieving subscriptions. Please try again later.');
  }
  return;
}

async function handleDeleteSubscription(conversation, ctx) {
  let subId;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Enter the Subscription ID to delete:');
    subId = message.text;
  } catch (e) { return; }

  try {
    await deleteSubscription(subId);
    await ctx.reply(`Subscription ${subId} deleted.`);
  } catch (err) {
    console.error('Error deleting subscription:', err?.response?.data || err);
    await ctx.reply('Failed to delete subscription. Please check the ID and try again.');
  }
  return;
}

module.exports = async function subscribeConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Create subscription', 'create_subscription')
    .row()
    .text('List subscriptions', 'list_subscriptions')
    .row()
    .text('Delete subscription', 'delete_subscription');

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
  } else if (callbackQueryData === 'list_subscriptions') {
    await handleListSubscriptions(conversation, ctx);
  } else if (callbackQueryData === 'delete_subscription') {
    await handleDeleteSubscription(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
  }
  return;
};