const { InlineKeyboard } = require('grammy');
const createOrderTrack = require('../../paypal/flows/createOrderTrack');
const ordersDb = require('../../db/orders');

async function handleCreateOrder(conversation, ctx) {
  await ctx.reply(`Let's create a new order. Please provide:`);

  let qty;
  while (true) {
    await ctx.reply('Question 1:\nQuantity:');
    const { message: { text } } = await conversation.wait();
    qty = parseInt(text);
    if (!isNaN(qty) && qty > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  await ctx.reply('Question 2:\nItem name:');
  const { message: { text: name } } = await conversation.wait();

  let price;
  while (true) {
    await ctx.reply('Question 3:\nPrice per item:');
    const { message: { text } } = await conversation.wait();
    price = parseFloat(text);
    if (!isNaN(price) && price > 0) break;
    await ctx.reply('Please enter a valid number greater than 0.');
  }

  await ctx.reply('Question 4:\nTracking number:');
  const { message: { text: tracking } } = await conversation.wait();

  try {
    const orderId = await createOrderTrack(name, qty, price, tracking);
    await ctx.reply(`Order ${orderId} created, paid, and tracking ${tracking} attached.`);
  } catch (err) {
    console.error('Error in /order conversation:', err?.response?.data || err);
    await ctx.reply('Failed to create order. Please try again.');
  }
  await conversation.exit();
}

async function handleListOrders(conversation, ctx) {
  try {
    const orders = await ordersDb.listOrders();
    if (!orders || orders.length === 0) {
      await ctx.reply('No orders found.');
      await conversation.exit();
      return;
    }
    const orderList = orders
      .map(order => `Order ID: ${order.id}, Item: ${order.name || order.item || 'N/A'}, Qty: ${order.qty || order.quantity || 'N/A'}, Price: ${order.price}, Status: ${order.status || 'N/A'}`)
      .join('\n');
    await ctx.reply(`Orders:\n${orderList}`);
  } catch (error) {
    console.error('Error retrieving orders:', error?.response?.data || error);
    await ctx.reply('An error occurred while retrieving orders. Please try again later.');
  }
  await conversation.exit();
}

module.exports = async function orderConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Create order', 'create_order')
    .row()
    .text('List orders', 'list_orders');

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

  if (callbackQueryData === 'create_order') {
    await handleCreateOrder(conversation, ctx);
  } else if (callbackQueryData === 'list_orders') {
    await handleListOrders(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
    await conversation.exit();
  }
};