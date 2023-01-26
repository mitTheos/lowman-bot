const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;
const { addRoles, getPlayer, clearRoles, rolesUpdate, rolesClear } = require("../../functions/helpers/rolesHelper");
const { getData } = require("../../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roles")
    .setDescription("Removed or updates all lowman roles")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand.setName("update").setDescription("Removes all lowman roles").addUserOption(option =>
      option.setName("user").setDescription("clear roles of specified user").setRequired(true))
    ).addSubcommand(subcommand => subcommand.setName("clear").setDescription("Removes all lowman roles").addUserOption(option =>
      option.setName("user").setDescription("clear roles of specified user").setRequired(true))
    ),
  async execute(interaction, client) {
    if (interaction.options.getSubcommand() === "update") {
      await rolesUpdate(interaction, client);
    } else if (interaction.options.getSubcommand() === "clear") {
      await rolesClear(interaction, client);
    }
  }
};