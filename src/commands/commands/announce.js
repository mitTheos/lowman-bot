const { SlashCommandBuilder, EmbedBuilder, ApplicationCommandOptionBase } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI");
const raidReportAPI = require("../../api/raidReportAPI");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getData } = require("../../functions/helpers/db");
const { convertTime } = require("../../functions/helpers/convertTime");
const { getBest, createRaidMessage, createPlayersMessage } = require("../../functions/helpers/announceHelper");
const { GUILD_ID, CHANNEL_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce monthly Stats")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
    option.setName("raid")
      .setDescription("Specify a raid")
      .setRequired(false)
      .addChoices(
        {name: "King", value: "kf"}
      )),

  async execute(interaction, client) {
    // Discord server and channel from .env
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);
    const channel = await guild.channels.fetch(CHANNEL_ID).catch(console.error);

    // loading message
    console.log("===Announcement===");
    await interaction.deferReply({
      fetchReply: true
    });

    // processing command message
    console.log("getting data for announcement...");
    getData(async (users) => {
      console.log("db data received, calculating PBs...");
      getBest(users, async (best) => {
        console.log("data for announcement ready!");
        // create messages
        const messageArray = [
          createPlayersMessage(users, best.playedUsersCountMonthly[1], best.playedUsersCountMonthly[0]),
          createRaidMessage(users, best.kf.players, best.kf.activityTime, "King's Fall", "https://i.imgur.com/ShWT8Nq.png"),
          createRaidMessage(users, best.vow.players, best.vow.activityTime, "Vow of the disciple", "https://i.imgur.com/MSwQTW1.png"),
          createRaidMessage(users, best.vog.players, best.vog.activityTime, "Vault of Glass", "https://i.imgur.com/dMcnYnq.png"),
          createRaidMessage(users, best.dsc.players, best.dsc.activityTime, "Deep Stone Crypt", "https://i.imgur.com/y603L7T.png"),
          createRaidMessage(users, best.gos.players, best.gos.activityTime, "Garden of Salvation", "https://i.imgur.com/EBfhOzf.png"),
          createRaidMessage(users, best.lw.players, best.lw.activityTime, "Last Wish", "https://imgur.com/Vs3CemK.png")
        ];

        // send messages
        for (const message of messageArray) {
          await channel.send(message).catch(console.error);
        }

        // update message. Command has been completed!
        await interaction.editReply({
          content: `Announcement posted!`
        });
        console.log("Announcement posted!");
      });
    });
  }
};