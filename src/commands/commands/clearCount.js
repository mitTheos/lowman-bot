const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { convertTime } = require("../../functions/helpers/convertTime");
const { getPlayedWith } = require("../../functions/helpers/monthlyStatsHelper");
const {
  vowEmoji_id, vowEmoji_name, kfEmoji_name, kfEmoji_id, vogEmoji_name, vogEmoji_id, dscEmoji_id, dscEmoji_name, gosEmoji_name, gosEmoji_id, wishEmoji_id,
  wishEmoji_name
} = require("../../config/emojis");
const { getMessageDate } = require("../../functions/helpers/announceHelper");
const { getDataWithId } = require("../../functions/helpers/db");
const { raidStats } = require("../../api/raidReportAPI");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clear-count")
    .setDescription("Display your total lowman clears ")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname),
  async execute(interaction, client) {

    // loading message
    console.log("===ClearCount===");
    const message = await interaction.deferReply({
      fetchReply: true
    });

    const member = interaction.member;
    const clearCount = new ClearCount(0,0,0,0,0,0,0);

    getDataWithId(member.id, (user) => {
      const membershipId = user["d2MembershipId"];

      raidStats(membershipId).then(async (data) => {
        const activities = data.response["activities"];

        if (activities != null) {
          for (const activity of activities) {
            const lowmans = activity["values"]["lowAccountCountActivities"];

            if (lowmans != null) {
              for (const lowman of lowmans) {
                clearCount.total++;

                //kf
                if (activity["activityHash"] === 1374392663) {
                  clearCount.kf++;
                }
                //vow
                else if (activity["activityHash"] === 1441982566) {
                  clearCount.vow++;
                }
                //vog
                else if (activity["activityHash"] === 3881495763) {
                  clearCount.vow++;
                }
                //dsc
                else if (activity["activityHash"] === 910380154) {
                  clearCount.dsc++;
                }
                //gos
                else if (activity["activityHash"] === 3458480158 || activity["activityHash"] === 2659723068) {
                  clearCount.gos++;
                }
                //lw
                else if (activity["activityHash"] === 2122313384) {
                  clearCount.lw++;
                }
              }
            }
          }
        }
        const totalEmbed = new EmbedBuilder()
          .setTitle(`Total lowman clears:`)
          .setColor(0xfa5c04)
          .addFields([
            {
              name: "clears:",
              value: clearCount.total.toString()
            }
          ]);

        const raidEmbed = new EmbedBuilder()
          .setTitle(`Lowman clears per Raid)`)
          .setColor(0xfa5c04)
          .addFields([
            {
              name: `<:${kfEmoji_name}:${kfEmoji_id}> KF`,
              value: clearCount.kf.toString(),
              inline: true
            },
            {
              name: `<:${vowEmoji_name}:${vowEmoji_id}> VoTD`,
              value: clearCount.vow.toString(),
              inline: true
            },
            {
              name: `<:${vogEmoji_name}:${vogEmoji_id}> VoG`,
              value: clearCount.vog.toString(),
              inline: true
            },
            {
              name: `<:${dscEmoji_name}:${dscEmoji_id}> DSC`,
              value: clearCount.dsc.toString(),
              inline: true
            },
            {
              name: `<:${gosEmoji_name}:${gosEmoji_id}> GoS`,
              value: clearCount.gos.toString(),
              inline: true
            },
            {
              name: `<:${wishEmoji_name}:${wishEmoji_id}> Wish`,
              value: clearCount.lw.toString(),
              inline: true
            }
          ]);

        await interaction.editReply({
          content: `${clearCount.total}`
        });
      });
    });


  }
};

async function getClearCount(interaction) {

}

class ClearCount {
  total;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;


  constructor(total, kf, vow, vog, dsc, gos, lw) {
    this.total = total;
    this.kf = kf;
    this.vow = vow;
    this.vog = vog;
    this.dsc = dsc;
    this.gos = gos;
    this.lw = lw;
  }
}
