const { SlashCommandBuilder } = require("discord.js");
const { updateRoles} = require("../../functions/helpers/rolesHelper");
const { lock_perms } = require("../../config/perms");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Remove all of your current Lowman roles.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(lock_perms)
    .addSubcommand(subcommand => subcommand.setName("roles").setDescription("Update all of your current Lowman roles.")),
  async execute(interaction, client) {
      // loading message
      console.log("===Update Roles===");
      await interaction.deferReply({
          fetchReply: true
      });
      await updateRoles(true, "Roles updated!", interaction, client, interaction.member);
  }
};
