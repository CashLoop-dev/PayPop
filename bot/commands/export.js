const fs = require('fs');
const path = require('path');
const { listSquareInvoicesByUser } = require('../../db/squareInvoices');
const { listSquareSubscriptionsByUser } = require('../../db/squareSubscriptions');

module.exports = async function exportConversation(conversation, ctx) {
  const userId = ctx.from.id;
  await ctx.reply(
    'Do you want to export your Square invoices and subscriptions?',
    {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Yes, export', callback_data: 'confirm_export' },
            { text: '❌ Cancel', callback_data: 'cancel_export' }
          ]
        ]
      }
    }
  );

  const confirmCtx = await conversation.waitForCallbackQuery(['confirm_export', 'cancel_export']);
  if (confirmCtx.callbackQuery.data === 'cancel_export') {
    await confirmCtx.reply('Export cancelled.');
    return;
  }

  try {
    const invoices = await listSquareInvoicesByUser(userId);
    const subs = await listSquareSubscriptionsByUser(userId);

    const tmpDir = path.join(__dirname, '../../tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const fileBase = path.join(tmpDir, `export_${userId}`);
    const csvPath = `${fileBase}.csv`;
    const jsonPath = `${fileBase}.json`;

    const csv = [
      'type,id,amount_or_plan,status,note_or_email',
      ...invoices.map(i => `invoice,${i.id},${i.amount},${i.status},"${i.note}"`),
      ...subs.map(s => `subscription,${s.id},,${s.status},"${s.email}"`)
    ].join('\n');

    fs.writeFileSync(csvPath, csv);
    fs.writeFileSync(jsonPath, JSON.stringify({ invoices, subscriptions: subs }, null, 2));

    await confirmCtx.replyWithDocument({ source: fs.createReadStream(csvPath), filename: 'history.csv' });
    await confirmCtx.replyWithDocument({ source: fs.createReadStream(jsonPath), filename: 'history.json' });
  } catch (err) {
    await confirmCtx.reply('❌ Failed to export data.');
    console.error(err);
  }
};
