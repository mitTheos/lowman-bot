const { SlashCommandBuilder } = require("discord.js");
const { deleteUser } = require("../../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("unregister")
    .setDescription("Unregisters you from the Lowman Bot")
    .setDMPermission(false),
  async execute(interaction, client) {
    // loading message
    console.log("===Unregister===");
    await interaction.deferReply({
      fetchReply: true
    });

    const discordId = interaction.member.id;
    deleteUser(discordId, async (user) => {
      await interaction.editReply({
        content: "Unregistered successfully!"
      }).then(() => console.log(`Unregistered user: { discordId: ${user["discordId"]}, d2MembershipId: ${user["d2MembershipId"]}}`))
    })
  }
};
