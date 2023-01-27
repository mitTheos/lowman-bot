const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;
const { addRoles, getPlayer, clearRoles, rolesUpdate, rolesClear } = require("../../functions/helpers/rolesHelper");
const { getData } = require("../../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Remove all of your current Lowman roles.")
    .setDMPermission(false)
    .addSubcommand(subcommand => subcommand.setName("roles").setDescription("Update all of your current Lowman roles.")),
  async execute(interaction, client) {
      await rolesUpdate(interaction, client, interaction.member);
  }
};
