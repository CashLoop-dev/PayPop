const {
  createCustomer,
  getCustomerById,
  findCustomerByEmail,
  updateCustomer
} = require('../../square/flows/customer');

module.exports = async function squareCustomerConversation(conversation, ctx) {
  // Step 1: Ask for action
  await ctx.reply(
    'What would you like to do with Square customers?',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '➕ Create', callback_data: 'create_customer' },
            { text: '🔍 Find by Email', callback_data: 'find_customer' },
            { text: '🆔 Get by ID', callback_data: 'get_customer' },
            { text: '✏️ Update', callback_data: 'update_customer' }
          ]
        ]
      }
    }
  );

  const actionCtx = await conversation.waitForCallbackQuery([
    'create_customer', 'find_customer', 'get_customer', 'update_customer'
  ]);
  const action = actionCtx.callbackQuery.data;

  if (action === 'create_customer') {
    await actionCtx.reply('Enter customer\'s email:');
    const emailMsg = await conversation.wait();
    const email = emailMsg.message?.text?.trim();
    if (!email || !email.includes('@')) return await ctx.reply('❌ Valid email required. Command cancelled.');

    await ctx.reply('Enter customer\'s first name:');
    const givenNameMsg = await conversation.wait();
    const givenName = givenNameMsg.message?.text?.trim();
    if (!givenName) return await ctx.reply('❌ First name required. Command cancelled.');

    await ctx.reply('Enter customer\'s last name (or type "skip"):');
    const familyNameMsg = await conversation.wait();
    let familyName = familyNameMsg.message?.text?.trim();
    if (!familyName || familyName.toLowerCase() === 'skip') familyName = '';

    await ctx.reply('Enter customer\'s phone number (or type "skip"):');
    const phoneMsg = await conversation.wait();
    let phone = phoneMsg.message?.text?.trim();
    if (!phone || phone.toLowerCase() === 'skip') phone = '';

    try {
      const customer = await createCustomer({ email, givenName, familyName, phone });
      await ctx.reply(`✅ Customer created!\nID: ${customer.id}\nName: ${customer.givenName} ${customer.familyName || ''}\nEmail: ${customer.emailAddress}`);
    } catch (err) {
      await ctx.reply('❌ Failed to create customer.\n' + (err.message || 'Unknown error.'));
    }
    return;
  }

  if (action === 'find_customer') {
    await actionCtx.reply('Enter customer\'s email to search:');
    const emailMsg = await conversation.wait();
    const email = emailMsg.message?.text?.trim();
    if (!email || !email.includes('@')) return await ctx.reply('❌ Valid email required. Command cancelled.');

    try {
      const customer = await findCustomerByEmail(email);
      if (customer) {
        await ctx.reply(`✅ Customer found!\nID: ${customer.id}\nName: ${customer.givenName} ${customer.familyName || ''}\nEmail: ${customer.emailAddress}`);
      } else {
        await ctx.reply('No customer found with that email.');
      }
    } catch (err) {
      await ctx.reply('❌ Failed to search customer.\n' + (err.message || 'Unknown error.'));
    }
    return;
  }

  if (action === 'get_customer') {
    await actionCtx.reply('Enter customer ID:');
    const idMsg = await conversation.wait();
    const customerId = idMsg.message?.text?.trim();
    if (!customerId) return await ctx.reply('❌ Customer ID required. Command cancelled.');

    try {
      const customer = await getCustomerById(customerId);
      await ctx.reply(`✅ Customer found!\nID: ${customer.id}\nName: ${customer.givenName} ${customer.familyName || ''}\nEmail: ${customer.emailAddress}`);
    } catch (err) {
      await ctx.reply('❌ Failed to retrieve customer.\n' + (err.message || 'Unknown error.'));
    }
    return;
  }

  if (action === 'update_customer') {
    await actionCtx.reply('Enter customer ID to update:');
    const idMsg = await conversation.wait();
    const customerId = idMsg.message?.text?.trim();
    if (!customerId) return await ctx.reply('❌ Customer ID required. Command cancelled.');

    await ctx.reply('Enter new email (or type "skip"):');
    const emailMsg = await conversation.wait();
    let email = emailMsg.message?.text?.trim();
    if (!email || email.toLowerCase() === 'skip') email = undefined;

    await ctx.reply('Enter new first name (or type "skip"):');
    const givenNameMsg = await conversation.wait();
    let givenName = givenNameMsg.message?.text?.trim();
    if (!givenName || givenName.toLowerCase() === 'skip') givenName = undefined;

    await ctx.reply('Enter new last name (or type "skip"):');
    const familyNameMsg = await conversation.wait();
    let familyName = familyNameMsg.message?.text?.trim();
    if (!familyName || familyName.toLowerCase() === 'skip') familyName = undefined;

    await ctx.reply('Enter new phone number (or type "skip"):');
    const phoneMsg = await conversation.wait();
    let phoneNumber = phoneMsg.message?.text?.trim();
    if (!phoneNumber || phoneNumber.toLowerCase() === 'skip') phoneNumber = undefined;

    const updates = {};
    if (email) updates.emailAddress = email;
    if (givenName) updates.givenName = givenName;
    if (familyName) updates.familyName = familyName;
    if (phoneNumber) updates.phoneNumber = phoneNumber;

    if (Object.keys(updates).length === 0) {
      await ctx.reply('No updates provided. Command cancelled.');
      return;
    }

    try {
      const customer = await updateCustomer(customerId, updates);
      await ctx.reply(`✅ Customer updated!\nID: ${customer.id}\nName: ${customer.givenName} ${customer.familyName || ''}\nEmail: ${customer.emailAddress}`);
    } catch (err) {
      await ctx.reply('❌ Failed to update customer.\n' + (err.message || 'Unknown error.'));
    }
    return;
  }
};