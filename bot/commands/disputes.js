const resolveDisputes = require('../../paypal/flows/resolveDisputes');

module.exports = async function disputes(ctx) {
  try {
    const id = await resolveDisputes();
    if (!id) return await ctx.reply('No open disputes found.');
    await ctx.reply(`Accepted dispute ${id}`);
  } catch (err) {
    console.error('Error in /disputes:', err);
    await ctx.reply('Failed to resolve disputes. Please try again.');
  }
};
