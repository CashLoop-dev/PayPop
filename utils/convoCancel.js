async function waitOrCancel(conversation, ctx, prompt) {
  await ctx.reply(prompt);
  const { message } = await conversation.wait();
  if (message && message.text && message.text.trim().toLowerCase() === '/cancel') {
    await ctx.reply('Operation cancelled.');
    throw new Error('cancelled');
  }
  return message;
}
module.exports = waitOrCancel;
