const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getClearCount } = require("../../functions/helpers/clearHelper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear-count")
    .setDescription("Display your total lowman clears.")
    .setDMPermission(false),
  async execute(interaction, client) {

    // loading message
    console.log("===Clear Count===");
    const message = await interaction.deferReply({
      fetchReply: true
    });

    const member = interaction.member;

    await getClearCount(interaction, member);
  }
};

