const fixInvoiceError = require('../../paypal/flows/fixInvoiceError');

module.exports = async function fixinvoiceConversation(conversation, ctx) {
  await ctx.reply(
    `Let's fix an invoice by canceling the old one and sending a new one.\n`
  );

  await ctx.reply('Question 1:\nOld invoice ID:');
  const { message: { text: oldId } } = await conversation.wait();

  await ctx.reply('Question 2:\nClient email for new invoice:');
  const { message: { text: email } } = await conversation.wait();

  try {
    const newId = await fixInvoiceError(oldId, email);
    await ctx.reply(`Old invoice ${oldId} canceled.\nNew invoice ${newId} sent.`);
  } catch (err) {
    console.error('Error in /fixinvoice conversation:', err);
    await ctx.reply('Failed to fix invoice. Please try again.');
  }
};

