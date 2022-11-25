const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
require("../../api/lowmanVerifierAPI.js");
const api = require("../../api/lowmanVerifierAPI");
const { data } = require("./ping");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Return completed lowmans")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Bungie name to lookup (with tag)")
        .setRequired(true)
    ), async execute(interaction, client) {

    //loading message
    const message = await interaction.deferReply({
      fetchReply: true
    });

    const username = interaction.options.get("username").value;

    api.getLowmans(username).then((data) => {

      //embed
      const embed = new EmbedBuilder()
        .setTitle("Lowman Stats")
        .setColor(0x18e1ee)
        .addFields([
          {
            name: "King's Fall",
            value: returnTag(data.kf),
            inline: true
          },
          {
            name: "Vow of the Disciple",
            value: returnTag(data.vow),
            inline: true
          },
          {
            name: "Vault of Glass",
            value: returnTag(data.vog),
            inline: true
          },
          {
            name: "Deepstone Crypt",
            value: returnTag(data.dsc),
            inline: true
          },
          {
            name: "Garden of Salvation",
            value: returnTag(data.gos),
            inline: true
          },
          {
            name: "Last Wish",
            value: returnTag(data.lw),
            inline: true
          }
        ]);

      interaction.editReply({
        embeds: [embed]
      });
    });
  }
};

class LowmanStats {
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(kf, vow, vog, dsc, gos, lw) {
    this.kf = kf;
    this.vow = vow;
    this.vog = vog;
    this.dsc = dsc;
    this.gos = gos;
    this.lw = lw;
  }

  toString() {
    return `LowmanStats {\nkf: { ${this.kf} },\nvow: { ${this.vog} },\ndsc: { ${this.dsc} },\ngos: { ${this.gos} },\nlw: { ${this.lw} }`;
  }
}

function returnTag(raid){
  if (raid["lowestFlawless"] === 2) {
    return "Duo Flawless";
  } else if(raid["lowestFlawless"]=== 3 && raid["lowest"] === 2){
    return "Duo | Trio Flawless";
  } else if (raid["lowestFlawless"] === 3){
    return "Trio Flawless";
  } else if(raid["lowest"] === 2){
    return "Duo";
  } else if(raid["lowest"] === 3){
    return "Trio";
  } else return "x"
}