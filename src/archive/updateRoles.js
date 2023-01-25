const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;
const { addRoles, getPlayer } = require("../functions/helpers/rolesHelper");
const { getData } = require("../functions/helpers/db");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update-rolesme")
    .setDescription("Update roles")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addUserOption(option =>
      option.setName("user").setDescription("update roles of specified user").setRequired(false)),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);


    // loading message
    console.log("===Update Roles===");
    await interaction.deferReply({
      fetchReply: true
    });

    // processing command
    console.log("getting data for update...");
    getData(async (users) => {
      console.log("db data received, calculating roles...");

      let userCounter = 1;
      for (const user of users) {
        getPlayer(user["d2MembershipId"], async (player) => {
          const member = await guild.members.fetch(user["discordId"]);
          if(interaction.options.get("user") === null){
            await addRoles(member, player, guild);
          } else if(interaction.options.get("user").value === user["discordId"]){
            await addRoles(member, player, guild);
          }

          // check if this was the last user to update roles for
          if (userCounter === users.length) {
            await interaction.editReply({
              content: `Roles updated!`
            });
            console.log("Roles updated!");
          } else {
            userCounter++;
          }
        });
      }
    });
  }
};