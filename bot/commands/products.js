const manageProducts = require('../../paypal/flows/manageProducts');

module.exports = async function productsConversation(conversation, ctx) {
  await ctx.reply(
    `Let's add or fetch a product.\n`
  );

  await ctx.reply('Question 1:\nProduct name:');
  const { message: { text: name } } = await conversation.wait();

  try {
    const product = await manageProducts(name);
    await ctx.reply(`Created + Fetched Product: ${product.id}\nName: ${product.name}`);
  } catch (err) {
    console.error('Error in /products conversation:', err);
    await ctx.reply('Failed to manage product. Please try again.');
  }
};
