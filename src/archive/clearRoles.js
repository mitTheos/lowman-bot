const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getPlayer, clearRoles } = require("../functions/helpers/rolesHelper");
const { getData } = require("../functions/helpers/db");
const {guild_id} = require("../config/guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clearme")
    .setDescription("Removes all lowman roles")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand.setName("roles").setDescription("Removes all lowman roles").addUserOption(option =>
      option.setName("user").setDescription("clear roles of specified user").setRequired(false))
    ),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(guild_id).catch(console.error);

    // loading message
    console.log("===Clear Roles===");
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true
    });

    // processing command
    console.log("getting data to clear roles...");
    getData(async (users) => {
      console.log("db data received, calculating roles...");

      let userCounter = 1;
      for (const user of users) {
        getPlayer(user["d2MembershipId"], async (player) => {
          const member = await guild.members.fetch(user["discordId"]);
          if(interaction.options.get("user") === null){
            await clearRoles(member, player, guild);
          } else if(interaction.options.get("user").value === user["discordId"]){
            await clearRoles(member, player, guild);
          }

          // check if this was the last user to clear roles for
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