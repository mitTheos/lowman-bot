const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getClearCount } = require("../../functions/helpers/clearHelper");
const { lock_perms } = require("../../config/perms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear-count")
    .setDescription("Display your total lowman clears.")
    .setDefaultMemberPermissions(lock_perms)
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