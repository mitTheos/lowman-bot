const {SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription('Return my ping'), async execute(interaction, client) {
        const message = await interaction.deferReply({
            fetchReply: true
        });

        console.log(`API Latency is ${client.ws.ping}, Client Ping is ${message.createdTimestamp - interaction.createdTimestamp}`)
        const newMessage = `API Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`;
        await interaction.editReply({
            content: newMessage
        })
    }
}