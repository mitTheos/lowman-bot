const { guild_id } = require("../../config/guild");
module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        const guild = await client.guilds.fetch(guild_id).catch(console.error);
        guild.members.fetch().then((members) => members.cache)
        console.log(`Ready! ${client.user.tag} is logged in and online`);
    }
}