const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;
const { addRoles, getPlayer } = require("../../functions/helpers/assignRolesHelper");
const { getData } = require("../../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assign-roles")
    .setDescription("Assign Lowman Roles based on lowman clears")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);


    // loading message
    console.log("===Assign Roles===");
    await interaction.deferReply({
      fetchReply: true
    });

    // processing command
    console.log("getting data for assignment...");
    getData(async (users) => {
      console.log("db data received, calculating roles...");

      let userCounter = 1;
      for (const user of users) {
        getPlayer(user["d2MembershipId"], async (player) => {
          const member = await guild.members.fetch(user["discordId"]);
          await addRoles(member, player, guild);

          // check if this was the last user to assign roles to
          if (userCounter === users.length) {
            await interaction.editReply({
              content: `Roles assigned!`
            });
            console.log("Roles assigned!");
          } else {
            userCounter++;
          }
        });
      }
    });
  }
};