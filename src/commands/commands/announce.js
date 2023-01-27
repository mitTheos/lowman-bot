const { SlashCommandBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { getData } = require("../../functions/helpers/db");
const { getBest, createRaidMessage, createPlayersMessage } = require("../../functions/helpers/announceHelper");
const { kfEmoji_id, wishEmoji_id, kfEmoji_name, vowEmoji_id, vowEmoji_name, vogEmoji_name, vogEmoji_id, dscEmoji_name, dscEmoji_id, gosEmoji_name, gosEmoji_id,
  wishEmoji_name
} = require("../../config/emojis");
const {guild_id, announce_channel_id} = require("../../config/guild");
const { GUILD_ID, CHANNEL_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("Send an announcement for the fastest raid times and most sherpas.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
      option.setName("only")
        .setDescription("Specify an individual raid or mentor.")
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
    const guild = await client.guilds.fetch(guild_id).catch(console.error);
    const channel = await guild.channels.fetch(announce_channel_id).catch(console.error);

    // loading message
    console.log("===Announcement===");
    await interaction.deferReply({
      fetchReply: true,
      ephemeral: true
    });

    // processing command message
    console.log("getting data for announcement...");
    getData(async (users) => {
      console.log("db data received, calculating PBs...");
      getBest(users, async (best) => {
        console.log("data for announcement ready!");

        const mentorMessage = createPlayersMessage(best.mentor, "https://i.imgur.com/vFAFjAZ.png");
        const kfMessage = createRaidMessage(best.kf.players, best.kf.activityTime, `<:${kfEmoji_name}:${kfEmoji_id}>`, "King's Fall", "https://i.imgur.com/ShWT8Nq.png");
        const vowMessage = createRaidMessage(best.vow.players, best.vow.activityTime, `<:${vowEmoji_name}:${vowEmoji_id}>`, "Vow of the Disciple", "https://i.imgur.com/MSwQTW1.png");
        const vogMessage = createRaidMessage(best.vog.players, best.vog.activityTime, `<:${vogEmoji_name}:${vogEmoji_id}>`, "Vault of Glass", "https://i.imgur.com/dMcnYnq.png");
        const dscMessage = createRaidMessage(best.dsc.players, best.dsc.activityTime, `<:${dscEmoji_name}:${dscEmoji_id}>`,"Deep Stone Crypt", "https://i.imgur.com/y603L7T.png");
        const gosMessage = createRaidMessage(best.gos.players, best.gos.activityTime, `<:${gosEmoji_name}:${gosEmoji_id}>`, "Garden of Salvation", "https://i.imgur.com/EBfhOzf.png");
        const lwMessage = createRaidMessage(best.lw.players, best.lw.activityTime, `<:${wishEmoji_name}:${wishEmoji_id}>`, "Last Wish", "https://i.imgur.com/FMDARhw.png");

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
