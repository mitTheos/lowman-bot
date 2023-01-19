const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;
const { addRoles, getPlayer, clearRoles } = require("../../functions/helpers/rolesHelper");
const { getData } = require("../../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear-roles")
    .setDescription("Removes all lowman roles")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);

    // loading message
    console.log("===Update Roles===");
    await interaction.deferReply({
      fetchReply: true
    });

    // processing command
    console.log("getting data to clear roles...");
    getData(async (users) => {
      console.log("db data received, calculating roles...");

      let userCounter = 1;
      for (const user of users) {
        getPlayer(user["d2MembershipId"], async (player) => {
          const member = await guild.members.fetch(user["discordId"]);
          await clearRoles(member, player, guild);

          //console.log(await member.roles.cache);

          // check if this was the last user to update roles to
          if (userCounter === users.length) {
            await interaction.editReply({
              content: `Roles cleared!`
            });
            console.log("Roles cleared!");
          } else {
            userCounter++;
          }
        });
      }
    });
  }
};