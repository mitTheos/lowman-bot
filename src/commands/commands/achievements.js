const { SlashCommandBuilder } = require("discord.js");
const { GUILD_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Shows all of your lowman achievements")
    .setDMPermission(false),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);

    console.log(interaction.member.cache);
    // loading message
    console.log("===Achievements===");
    await interaction.deferReply({
      fetchReply: true
    });

  }
};