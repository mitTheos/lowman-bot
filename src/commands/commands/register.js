require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("register to Lowman Bot"),
  async execute(interaction, client) {
    // loading message
    console.log("===Register===");
    await interaction.deferReply({
      fetchReply: true
    });

    const embed = new EmbedBuilder()
      .setTitle("Register")
      .addFields({
        name: "Authorize",
        value: "https://lowman-bot.up.railway.app/"
        }
      );

      await interaction.editReply({
        embeds: [embed]
      });
  }
};