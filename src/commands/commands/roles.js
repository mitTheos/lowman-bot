const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { rolesUpdate, rolesClear, updateRoles} = require("../../functions/helpers/rolesHelper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("forceroles")
    .setDescription("Update or remove a user's current Lowman roles.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(subcommand => subcommand.setName("refresh").setDescription("Manually refresh a user's current Lowman Roles.").addUserOption(option =>
      option.setName("user").setDescription("clear roles of specified user").setRequired(true))
    ).addSubcommand(subcommand => subcommand.setName("remove").setDescription("Manually remove a user's current Lowman Roles.").addUserOption(option =>
      option.setName("user").setDescription("clear roles of specified user").setRequired(true))
    ),
  async execute(interaction, client) {
    // loading message
    console.log("===Force Refresh===");
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true
    });
    const member = interaction.options._hoistedOptions[0].member;

    if (interaction.options.getSubcommand() === "refresh") {
      await updateRoles(true, "Roles updated!", interaction, client, member);
    } else if (interaction.options.getSubcommand() === "remove") {
      await updateRoles(false, "Roles removed!", interaction, client, member);
    }
  }
};
