require('dotenv').config();
const {TOKEN, DATABASE_TOKEN} = process.env;
const {connect} = require('mongoose');
const {Client, Collection, GatewayIntentBits} = require('discord.js');
const fs = require('fs');

const client = new Client({intents: GatewayIntentBits.Guilds});
client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const functionFiles = fs.readdirSync(`./src/functions/handlers`).filter((file) => file.endsWith(".js"));
    for (const file of functionFiles)
        require(`./functions/handlers/${file}`)(client);
}
require(`/src/oauth2/index,js`)(client);

client.handleEvents();
client.handleCommands();
client.login(TOKEN);
connect(DATABASE_TOKEN).catch(console.error);


