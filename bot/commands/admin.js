const { InlineKeyboard } = require('grammy');
const { getInvoices } = require('../../paypal/flows/invoiceClient');
const { listOrders } = require('../../db/orders');
const { listSubscriptions } = require('../../paypal/flows/createSubscription');
const { exportToCSV, exportToPDF } = require('../../utils/exportData');
const waitOrCancel = require('../../utils/convoCancel');
require('dotenv').config();

const PAGE_SIZE = 5;

// Parse whitelist as array of numbers or strings
const ADMIN_IDS = (process.env.BOT_WHITELIST || '')
  .split(',')
  .map(id => id.trim())
  .filter(Boolean);

function isAdmin(ctx) {
  return ADMIN_IDS.includes(String(ctx.from.id));
}

async function handleShowStats(ctx) {
  const invoices = await getInvoices();
  const orders = await listOrders();
  const subscriptions = await listSubscriptions();

  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.amount?.value) || 0), 0);
  const outstanding = invoices.filter(inv => inv.status !== 'PAID').length;
  const activeSubs = subscriptions.filter(sub => sub.status === 'ACTIVE').length;

  await ctx.reply(
    `📊 *Admin Dashboard*\n\n` +
    `Total Sales: $${totalSales.toFixed(2)}\n` +
    `Outstanding Invoices: ${outstanding}\n` +
    `Active Subscriptions: ${activeSubs}`,
    { parse_mode: 'Markdown' }
  );
}

async function handleExport(ctx, type) {
  await ctx.reply('Exporting data...');
  try {
    const invoices = await getInvoices();
    const orders = await listOrders();
    const subscriptions = await listSubscriptions();

    let buffer, filename;
    if (type === 'csv') {
      buffer = exportToCSV({ invoices, orders, subscriptions });
      filename = 'dashboard_export.csv';
    } else {
      buffer = await exportToPDF({ invoices, orders, subscriptions });
      filename = 'dashboard_export.pdf';
    }
    await ctx.replyWithDocument({ source: buffer, filename });
  } catch (err) {
    await ctx.reply('Failed to export data.');
  }
}

function buildPaginationKeyboard(type, page, totalPages) {
  const keyboard = new InlineKeyboard();
  if (page > 0) keyboard.text('⬅️ Prev', `${type}_page_${page - 1}`);
  if (page < totalPages - 1) keyboard.text('Next ➡️', `${type}_page_${page + 1}`);
  keyboard.row().text('Back', 'back_to_menu');
  return keyboard;
}

async function handlePaginatedList(ctx, type, page = 0) {
  let items, totalPages, text;
  if (type === 'invoices') {
    items = await getInvoices();
    totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    text = '*Invoices:*\n' + pageItems.map(inv =>
      `ID: ${inv.id}, Amount: ${inv.amount?.value || 'N/A'}, Status: ${inv.status}`
    ).join('\n');
  } else if (type === 'orders') {
    items = await listOrders();
    totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    text = '*Orders:*\n' + pageItems.map(order =>
      `ID: ${order.id}, Item: ${order.name || order.item || 'N/A'}, Qty: ${order.qty || order.quantity || 'N/A'}, Price: ${order.price}, Status: ${order.status || 'N/A'}`
    ).join('\n');
  } else if (type === 'subscriptions') {
    items = await listSubscriptions();
    totalPages = Math.ceil(items.length / PAGE_SIZE);
    const pageItems = items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    text = '*Subscriptions:*\n' + pageItems.map(sub =>
      `ID: ${sub.id}, Email: ${sub.email || 'N/A'}, Name: ${sub.name || 'N/A'}, Status: ${sub.status || 'N/A'}`
    ).join('\n');
  } else {
    return;
  }
  await ctx.reply(text, {
    parse_mode: 'Markdown',
    reply_markup: buildPaginationKeyboard(type, page, totalPages)
  });
}

module.exports = async function adminDashboard(conversation, ctx) {
  if (!isAdmin(ctx)) {
    await ctx.reply('Access denied.');
    return;
  }

  const mainKeyboard = new InlineKeyboard()
    .text('Show Stats', 'show_stats')
    .row()
    .text('List Invoices', 'list_invoices')
    .row()
    .text('List Orders', 'list_orders')
    .row()
    .text('List Subscriptions', 'list_subscriptions')
    .row()
    .text('Export CSV', 'export_csv')
    .row()
    .text('Export PDF', 'export_pdf')
    .row()
    .text('Cancel', 'cancel_admin');

  await ctx.reply('What would you like to do?', { reply_markup: mainKeyboard });

  let callbackQueryData = null;
  let page = 0;
  let listType = null;

  while (true) {
    const update = await conversation.wait();
    if (update.callbackQuery && update.callbackQuery.data) {
      callbackQueryData = update.callbackQuery.data;
      await ctx.api.answerCallbackQuery(update.callbackQuery.id);

      // Cancel support
      if (callbackQueryData === 'cancel_admin') {
        await ctx.reply('Admin operation cancelled.');
        return;
      }

      // Pagination handling
      if (callbackQueryData.startsWith('invoices_page_')) {
        page = parseInt(callbackQueryData.split('_').pop(), 10);
        listType = 'invoices';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'invoices', page);
        continue;
      }
      if (callbackQueryData.startsWith('orders_page_')) {
        page = parseInt(callbackQueryData.split('_').pop(), 10);
        listType = 'orders';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'orders', page);
        continue;
      }
      if (callbackQueryData.startsWith('subscriptions_page_')) {
        page = parseInt(callbackQueryData.split('_').pop(), 10);
        listType = 'subscriptions';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'subscriptions', page);
        continue;
      }
      if (callbackQueryData === 'back_to_menu') {
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await ctx.reply('What would you like to do?', { reply_markup: mainKeyboard });
        continue;
      }

      // Main menu actions
      if (callbackQueryData === 'show_stats') {
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handleShowStats(ctx);
      } else if (callbackQueryData === 'list_invoices') {
        page = 0;
        listType = 'invoices';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'invoices', page);
      } else if (callbackQueryData === 'list_orders') {
        page = 0;
        listType = 'orders';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'orders', page);
      } else if (callbackQueryData === 'list_subscriptions') {
        page = 0;
        listType = 'subscriptions';
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handlePaginatedList(ctx, 'subscriptions', page);
      } else if (callbackQueryData === 'export_csv') {
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handleExport(ctx, 'csv');
      } else if (callbackQueryData === 'export_pdf') {
        await ctx.api.editMessageReplyMarkup(
          update.callbackQuery.message.chat.id,
          update.callbackQuery.message.message_id,
          undefined
        );
        await handleExport(ctx, 'pdf');
      } else {
        await ctx.reply('Unknown action.');
      }
    } else if (update.message && update.message.text && update.message.text.trim().toLowerCase() === '/cancel') {
      await ctx.reply('Admin operation cancelled.');
      return;
    } else {
      await ctx.reply('Please choose an option using the buttons above or type /cancel to exit.');
    }
  }
};