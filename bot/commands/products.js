const { InlineKeyboard } = require('grammy');
const manageProducts = require('../../paypal/flows/manageProducts');
const listProducts = require('../../paypal/flows/listProducts');
const deleteProduct = require('../../paypal/flows/deleteProduct');
const waitOrCancel = require('../../utils/convoCancel');

async function handleAddOrFetchProduct(conversation, ctx) {
  let name;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Product name:');
    name = message.text;
  } catch (e) { return; }

  try {
    const product = await manageProducts(name);
    await ctx.reply(`Created + Fetched Product: ${product.id}\nName: ${product.name}`);
  } catch (err) {
    console.error('Error in /products conversation:', err);
    await ctx.reply('Failed to manage product. Please try again.');
  }
  return;
}

async function handleListProducts(conversation, ctx) {
  try {
    const products = await listProducts();
    if (!products || products.length === 0) {
      await ctx.reply('No products found.');
      return;
    }
    const productList = products
      .map(prod => `ID: ${prod.id}, Name: ${prod.name || 'N/A'}`)
      .join('\n');
    await ctx.reply(`Products:\n${productList}`);
  } catch (err) {
    console.error('Error listing products:', err);
    await ctx.reply('Failed to list products. Please try again.');
  }
  return;
}

async function handleDeleteProduct(conversation, ctx) {
  let prodId;
  try {
    const message = await waitOrCancel(conversation, ctx, 'Enter the Product ID to delete:');
    prodId = message.text;
  } catch (e) { return; }

  try {
    await deleteProduct(prodId);
    await ctx.reply(`Product ${prodId} deleted.`);
  } catch (err) {
    console.error('Error deleting product:', err);
    await ctx.reply('Failed to delete product. Please check the ID and try again.');
  }
  return;
}

module.exports = async function productsConversation(conversation, ctx) {
  const keyboard = new InlineKeyboard()
    .text('Add/Fetch product', 'add_product')
    .row()
    .text('List products', 'list_products')
    .row()
    .text('Delete product', 'delete_product');

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

  if (callbackQueryData === 'add_product') {
    await handleAddOrFetchProduct(conversation, ctx);
  } else if (callbackQueryData === 'list_products') {
    await handleListProducts(conversation, ctx);
  } else if (callbackQueryData === 'delete_product') {
    await handleDeleteProduct(conversation, ctx);
  } else {
    await ctx.reply('Unknown action.');
  }
  return;
};
