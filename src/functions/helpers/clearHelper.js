const { getDataWithId } = require("./db");
const { raidStats } = require("../../api/raidReportAPI");
const { EmbedBuilder } = require("discord.js");
const {
  kfEmoji_name,
  kfEmoji_id,
  vowEmoji_name,
  vowEmoji_id,
  vogEmoji_name,
  vogEmoji_id,
  dscEmoji_name,
  dscEmoji_id,
  gosEmoji_name,
  gosEmoji_id,
  wishEmoji_name,
  wishEmoji_id
} = require("../../config/emojis");

exports.getClearCount = function getClearCount(interaction, member) {
  let clearCount = new ClearCount(0, 0, 0, 0, 0, 0, 0);

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

              console.log(clearCount);
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
                clearCount.vog++;
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
      const raidEmbed = new EmbedBuilder()
        .setTitle(`Lowman clears per Raid`)
        .setAuthor({ name: `${member.displayName}\`s clears:`, iconURL: `${member.displayAvatarURL()}` })
        .setColor(0xfa5c04)
        .addFields([
          {
            name: "Total:",
            value: clearCount.total.toString()
          },
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
        embeds: [raidEmbed]
      });
    });
  });
};

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