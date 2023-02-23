const { SlashCommandBuilder } = require("discord.js");
const { deleteUser } = require("../../functions/helpers/db");
const { updateRoles } = require("../../functions/helpers/rolesHelper");
const { lock_perms } = require("../../config/perms");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Unregisters you from the Lowman Bot")
    .setDefaultMemberPermissions(lock_perms)
    .setDMPermission(false),
  async execute(interaction, client) {
    // loading message
    console.log("===Unregister===");
    await interaction.deferReply({
      fetchReply: true
    });

    const discordId = interaction.member.id;

    //clear roles before unregistering
    await updateRoles(false, "Unregistered successfully!", interaction, client, interaction.member).then(async () => {
      //delete document in DB
      try {
        deleteUser(discordId, async (user) => {
          console.log(`Unregistered user: { discordId: ${user["discordId"]}, d2MembershipId: ${user["d2MembershipId"]}}`);
        })
      } catch (ex) {
        await interaction.editReply({
          content: "An error occurred, the command failed to complete!"
        }).then(() => console.error(ex));
      }
    })


  }
};
