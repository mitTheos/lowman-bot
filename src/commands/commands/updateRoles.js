const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { rolesUpdate, updateRoles} = require("../../functions/helpers/rolesHelper");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Remove all of your current Lowman roles.")
    .setDMPermission(false)
    .addSubcommand(subcommand => subcommand.setName("roles").setDescription("Update all of your current Lowman roles.")),
  async execute(interaction, client) {
      // loading message
      console.log("===Update Roles===");
      await interaction.deferReply({
          fetchReply: true
      });
      await updateRoles(true, interaction, client, interaction.member);
  }
};
