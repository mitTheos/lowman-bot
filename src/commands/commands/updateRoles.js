const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Remove all of your current Lowman roles.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .addSubcommand(subcommand => subcommand.setName("roles").setDescription("Update all of your current Lowman roles.")),
  async execute(interaction, client) {
      await rolesUpdate(interaction, client, interaction.member);
  }
};
