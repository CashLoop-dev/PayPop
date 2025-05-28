const fs = require('fs');
const path = require('path');
const { Bot } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');
require('dotenv').config();

const bot = new Bot(process.env.BOT_TOKEN);

// Load the whitelist from environment variable
const whitelist = (process.env.BOT_WHITELIST || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

// Whitelist middleware
bot.use(async (ctx, next) => {
  if (whitelist.length === 0 || (ctx.from && whitelist.includes(String(ctx.from.id)))) {
    return next();
  }
  await ctx.reply('⛔️ You are not authorized to use this bot.');
});

// Enable conversations plugin
bot.use(conversations());

// Register PayPal and other conversations
const invoiceConversation = require('./commands/invoice');
const orderConversation = require('./commands/order');
const subscribeConversation = require('./commands/subscribe');
const productsConversation = require('./commands/products');
const reconcileConversation = require('./commands/reconcile');
const disputeConversation = require('./commands/disputes');
const adminDashboard = require('./commands/admin');

// Register Square conversations
const squareInvoiceConversation = require('./commands/squareinvoice');
const squareSubscribeConversation = require('./commands/squaresubscribe');
const squareCancelConversation = require('./commands/squarecancel');
const squareHistoryConversation = require('./commands/squarehistory');
const exportConversation = require('./commands/export');
const squareCustomerConversation = require('./commands/squarecustomer'); // <-- Add customer command

// Use conversations
bot.use(createConversation(invoiceConversation, 'invoiceConversation'));
bot.use(createConversation(orderConversation, 'orderConversation'));
bot.use(createConversation(subscribeConversation, 'subscribeConversation'));
bot.use(createConversation(productsConversation, 'productsConversation'));
bot.use(createConversation(reconcileConversation, 'reconcileConversation'));
bot.use(createConversation(disputeConversation, 'disputeConversation'));
bot.use(createConversation(adminDashboard, 'adminDashboard'));

// Square
bot.use(createConversation(squareInvoiceConversation, 'squareInvoiceConversation'));
bot.use(createConversation(squareSubscribeConversation, 'squareSubscribeConversation'));
bot.use(createConversation(squareCancelConversation, 'squareCancelConversation'));
bot.use(createConversation(squareHistoryConversation, 'squareHistoryConversation'));
bot.use(createConversation(exportConversation, 'exportConversation'));
bot.use(createConversation(squareCustomerConversation, 'squareCustomerConversation')); // <-- Add customer conversation

// Register commands to start conversations
bot.command('invoice', async (ctx) => await ctx.conversation.enter('invoiceConversation'));
bot.command('order', async (ctx) => await ctx.conversation.enter('orderConversation'));
bot.command('subscribe', async (ctx) => await ctx.conversation.enter('subscribeConversation'));
bot.command('products', async (ctx) => await ctx.conversation.enter('productsConversation'));
bot.command('reconcile', async (ctx) => await ctx.conversation.enter('reconcileConversation'));
bot.command('disputes', async (ctx) => await ctx.conversation.enter('disputeConversation'));
bot.command('admin', async (ctx) => await ctx.conversation.enter('adminDashboard'));

// Square commands
bot.command('square_invoice', async (ctx) => await ctx.conversation.enter('squareInvoiceConversation'));
bot.command('square_subscribe', async (ctx) => await ctx.conversation.enter('squareSubscribeConversation'));
bot.command('square_cancel', async (ctx) => await ctx.conversation.enter('squareCancelConversation'));
bot.command('square_history', async (ctx) => await ctx.conversation.enter('squareHistoryConversation'));
bot.command('square_export', async (ctx) => await ctx.conversation.enter('exportConversation'));
bot.command('square_customer', async (ctx) => await ctx.conversation.enter('squareCustomerConversation')); // <-- Add customer command

// Non-interactive commands
bot.command('help', require('./commands/help'));
bot.command('disputes', require('./commands/disputes'));
bot.command('listInvoices', require('./commands/fixinvoice'));

// bot error handling
bot.catch((err) => {
  console.error('Error in bot:', err);
  if (err instanceof Error) {
    console.error('Error message:', err.message);
  }
});

bot.start();
console.log('PayPop bot started.');
