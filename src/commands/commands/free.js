require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("free")
    .setDescription("Vouch to free someone from jail.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
    .addUserOption(option =>
      option.setName("user").setDescription("Specify a user to free up.").setRequired(true)),
  async execute(interaction, client) {
    // loading message
    console.log("===Free===");
    await interaction.deferReply({
      fetchReply: true
    });
    if (interaction.options.get("user").value !== null) {
      await interaction.editReply({
        content: `Free up <@${interaction.options.get("user").value}>, he's done nothing wrong. 🙏`
      }).then(() => console.log("Posted message!"));
    } else {
      await interaction.editReply({
        content: `Invalid User!`
      }).then(() => console.log("Invalid User!"));
    }
  }
};
