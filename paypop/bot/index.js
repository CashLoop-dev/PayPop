const { Client, GatewayIntentBits } = require('discord.js');
const { token } = process.env; // Assuming the bot token is stored in the .env file
const commandFiles = ['order.js', 'invoice.js', 'listOrders.js', 'listInvoices.js'];
const commands = {};

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands[command.name] = command;
}

client.on('messageCreate', message => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (commands[commandName]) {
        commands[commandName].execute(message, args);
    }
});

client.login(token);