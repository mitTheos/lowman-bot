const { SlashCommandBuilder } = require("discord.js");
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
    const message = await interaction.deferReply({
      fetchReply: true
    });

    const username = interaction.options.get("username").value;

    api.getLowmans(username).then((data) => {

      interaction.editReply({
        content: `Lowmans:
        kf: { normal: ${data.kf["lowest"]}, flawless: ${data.kf["lowestFlawless"]} },
        vow: { normal: ${data.vow["lowest"]}, flawless: ${data.vow["lowestFlawless"]} },
        vog: { normal: ${data.vog["lowest"]}, flawless: ${data.vog["lowestFlawless"]} },
        dsc: { normal: ${data.dsc["lowest"]}, flawless: ${data.dsc["lowestFlawless"]} },
        gos: { normal: ${data.gos["lowest"]}, flawless: ${data.gos["lowestFlawless"]} },
        lw: { normal: ${data.lw["lowest"]}, flawless: ${data.lw["lowestFlawless"]} }`
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