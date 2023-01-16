const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getData } = require("../../functions/helpers/db");
const { getBest, createRaidMessage, createPlayersMessage } = require("../../functions/helpers/announceHelper");
const { GUILD_ID, CHANNEL_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Announce monthly Stats")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName("only")
        .setDescription("Specify a Raid or Mentor to announce on its own")
        .setRequired(false)
        .addChoices(
          { name: "Mentor", value: "mentor" },
          { name: "King's Fall", value: "kf" },
          { name: "Vow of the Disciple", value: "vow" },
          { name: "Vault of Glass", value: "vog" },
          { name: "Deep Stone Crypt", value: "dsc" },
          { name: "Garden of Salvation", value: "gos" },
          { name: "Last Wish", value: "lw" }
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

        const mentorMessage = createPlayersMessage(users, best.playedUsersCountMonthly[1], best.playedUsersCountMonthly[0]);
        const kfMessage = createRaidMessage(users, best.kf.players, best.kf.activityTime, "King's Fall", "https://i.imgur.com/ShWT8Nq.png");
        const vowMessage = createRaidMessage(users, best.vow.players, best.vow.activityTime, "Vow of the disciple", "https://i.imgur.com/MSwQTW1.png");
        const vogMessage = createRaidMessage(users, best.vog.players, best.vog.activityTime, "Vault of Glass", "https://i.imgur.com/dMcnYnq.png");
        const dscMessage = createRaidMessage(users, best.dsc.players, best.dsc.activityTime, "Deep Stone Crypt", "https://i.imgur.com/y603L7T.png");
        const gosMessage = createRaidMessage(users, best.gos.players, best.gos.activityTime, "Garden of Salvation", "https://i.imgur.com/EBfhOzf.png");
        const lwMessage = createRaidMessage(users, best.lw.players, best.lw.activityTime, "Last Wish", "https://i.imgur.com/FMDARhw.png");

        // create messages
        let messageArray;
        if (interaction.options.get("only") === null) {
          messageArray = [mentorMessage, kfMessage, vowMessage, vogMessage, dscMessage, gosMessage, lwMessage];
        } else {
          switch (interaction.options.get("only").value) {
            case "mentor":
              messageArray = [mentorMessage];
              break;
            case "kf":
              messageArray = [kfMessage];
              break;
            case "vow":
              messageArray = [vowMessage];
              break;
            case "vog":
              messageArray = [vogMessage];
              break;
            case "dsc":
              messageArray = [dscMessage];
              break;
            case "gos":
              messageArray = [gosMessage];
              break;
            case "lw":
              messageArray = [lwMessage];
              break;
          }
        }

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