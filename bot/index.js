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

// Add whitelist middleware FIRST
bot.use(async (ctx, next) => {
  if (whitelist.length === 0 || whitelist.includes(String(ctx.from?.id))) {
    return next();
  }
  return ctx.reply('Access denied.');
});

bot.use(conversations());

// Register conversations
const invoiceConversation = require('./commands/invoice');
const orderConversation = require('./commands/order');
const subscribeConversation = require('./commands/subscribe');
const productsConversation = require('./commands/products');
const reconcileConversation = require('./commands/reconcile');
const disputeConversation = require('./commands/disputes');
const adminDashboard = require('./commands/admin');

bot.use(createConversation(invoiceConversation));
bot.use(createConversation(orderConversation));
bot.use(createConversation(subscribeConversation));
bot.use(createConversation(productsConversation));
bot.use(createConversation(reconcileConversation));
bot.use(createConversation(disputeConversation));
bot.use(createConversation(adminDashboard));

// Register commands to start conversations
bot.command('invoice', async (ctx) => await ctx.conversation.enter('invoiceConversation'));
bot.command('order', async (ctx) => await ctx.conversation.enter('orderConversation'));
bot.command('subscribe', async (ctx) => await ctx.conversation.enter('subscribeConversation'));
bot.command('products', async (ctx) => await ctx.conversation.enter('productsConversation'));
bot.command('reconcile', async (ctx) => await ctx.conversation.enter('reconcileConversation'));
bot.command('dispute', async (ctx) => await ctx.conversation.enter('disputeConversation'));
bot.command('admin', async (ctx) => await ctx.conversation.enter('adminDashboard'));

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
