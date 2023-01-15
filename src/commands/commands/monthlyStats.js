require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI.js");
const raidReportAPI = require("../../api/raidReportAPI.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { convertTime } = require("../../functions/helpers/convertTime");
const { getPlayedWith, MonthlyPB } = require("../../functions/helpers/monthlyStatsHelper");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("monthly-stats")
    .setDescription("Return stats on the past month")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Bungie username")
        .setRequired(true)
    )
    .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {

    const username = interaction.options.get("username").value;

    // loading message
    console.log("===MonthlyStats===");
    const message = await interaction.deferReply({
      fetchReply: true
    });
    getPlayedWith(username, async (callback) => {
      console.log(`Getting monthly stats for: ${username}`);
      const playedWithList = callback[0];
      const lowmanList = callback[1];
      const pb = new MonthlyPB(lowmanList);

      const embed = new EmbedBuilder()
        .setTitle("Players you've played with this month")
        .setColor(0xfa5c04)
        .addFields([
          {
            name: "Players",
            value: playedWithList.length.toString()
          }
        ]);
      const embed2 = new EmbedBuilder()
        .setTitle("Fastest lowmans this month")
        .setColor(0xfa5c04)
        .addFields([
          {
            name: "KF",
            value: convertTime(pb.kf),
            inline: true
          },
          {
            name: "VOW",
            value: convertTime(pb.vow),
            inline: true
          },
          {
            name: "VOG",
            value: convertTime(pb.vog),
            inline: true
          },
          {
            name: "DSC",
            value: convertTime(pb.dsc),
            inline: true
          },
          {
            name: "GOS",
            value: convertTime(pb.gos),
            inline: true
          },
          {
            name: "LW",
            value: convertTime(pb.lw),
            inline: true
          }
        ]);

      await interaction.editReply({
        embeds: [embed, embed2]
      }).then(console.log("Monthly Stats posted!"));
    });
  }
};