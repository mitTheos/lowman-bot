const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder().setName("ping").setDescription("Return my ping").setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction, client) {
    console.log("===Ping===");
    const message = await interaction.deferReply({
      fetchReply: true
    });

    console.log(`API Latency is ${client.ws.ping}, Client Ping is ${message.createdTimestamp - interaction.createdTimestamp}`);
    const newMessage = `API Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`;
    await interaction.editReply({
      content: newMessage
    }).then(() => console.log("Ping posted!"));
  }
};