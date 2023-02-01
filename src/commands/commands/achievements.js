const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
  kfDuo_id,
  kfTrio_id,
  kfTrioF_id,
  kfTrioMF_id,
  vowTrio_id,
  vowTrioF_id,
  vowTrioMF_id,
  vogTrio_id,
  vogTrioF_id,
  vogDuo_id,
  vogDuoF_id,
  vogTrioMF_id,
  vogDuoMF_id,
  vogSolo_id,
  dscTrio_id,
  dscTrioF_id,
  dscDuo_id,
  dscDuoF_id,
  gosTrio_id,
  gosTrioF_id,
  gosDuo_id,
  lwTrio_id,
  lwTrioF_id,
  lwDuo_id,
  lwSolo_id,
  eowSolo_id,
  scourgeTrioF_id,
  scourgeDuo_id,
  crownTrioF_id,
  crownDuoF_id,
  leviDuo_id, eowDuo_id
} = require("../../config/roles");
const {
  kfEmoji_name, kfEmoji_id, vogEmoji_name, vogEmoji_id, vowEmoji_name, vowEmoji_id, dscEmoji_name, dscEmoji_id, gosEmoji_name, gosEmoji_id, wishEmoji_name,
  wishEmoji_id, crownEmoji_name, crownEmoji_id, scourgeEmoji_name, scourgeEmoji_id, leviEmoji_name, leviEmoji_id
} = require("../../config/emojis");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("achievements")
    .setDescription("Display a full list of all of your accomplishments.")
    .setDMPermission(false).addUserOption(option =>
      option.setName("user").setDescription("Get Achievements from specified Player").setRequired(false)),
  async execute(interaction, client) {

    // loading message
    console.log("===Achievements===");
    await interaction.deferReply({
      fetchReply: true
    });

    let soloArray = [];
    let duoArray = [];
    let trioArray = [];


    let member;
    if (interaction.options.get("user") === null) {
      member = interaction.member;
    } else {
      member = interaction.options.get("user").member;
    }

    const list = member.roles.cache;
    const sortedRoles = list.sort((a, b) => (a.position < b.position) ? 1 : -1);
    sortedRoles.forEach((role) => {
      switch (role.id) {
        case kfTrioMF_id:
          trioArray.push(`<:${kfEmoji_name}:${kfEmoji_id}> **Trio Flawless:** King's Fall (Master)`);
          break;
        case kfTrioF_id:
          trioArray.push(`<:${kfEmoji_name}:${kfEmoji_id}> **Trio Flawless:** King's Fall`);
          break;
        case kfDuo_id:
          duoArray.push(`<:${kfEmoji_name}:${kfEmoji_id}> **Duo:** Oryx`);
          break;
        case kfTrio_id:
          trioArray.push(`<:${kfEmoji_name}:${kfEmoji_id}> **Trio:** King's Fall`);
          break;
        case vowTrioMF_id:
          trioArray.push(`<:${vowEmoji_name}:${vowEmoji_id}> **Trio Flawless:** Vow of the Disciple (Master)`);
          break;
        case vowTrioF_id:
          trioArray.push(`<:${vowEmoji_name}:${vowEmoji_id}> **Trio Flawless:** Vow of the Disciple`);
          break;
        case vowTrio_id:
          trioArray.push(`<:${vowEmoji_name}:${vowEmoji_id}> **Trio:** Vow of the Disciple`);
          break;
        case vogTrioMF_id:
          trioArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Trio Flawless:** Vault of Glass (Master)`);
          break;
        case vogTrioF_id:
          trioArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Trio Flawless:** Vault of Glass`);
          break;
        case vogTrio_id:
          trioArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Trio:** Vault of Glass`);
          break;
        case vogDuoMF_id:
          duoArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Duo Flawless:** Vault of Glass (Master)`);
          break;
        case vogDuoF_id:
          duoArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Duo Flawless:** Vault of Glass`);
          break;
        case vogDuo_id :
          duoArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Duo:** Vault of Glass`);
          break;
        case vogSolo_id:
          soloArray.push(`<:${vogEmoji_name}:${vogEmoji_id}> **Solo:** Atheon`);
          break;
        case dscDuoF_id:
          duoArray.push(`<:${dscEmoji_name}:${dscEmoji_id}> **Duo Flawless:** Deep Stone Crypt`);
          break;
        case dscDuo_id:
          duoArray.push(`<:${dscEmoji_name}:${dscEmoji_id}> **Duo:** Deep Stone Crypt`);
          break;
        case dscTrioF_id:
          trioArray.push(`<:${dscEmoji_name}:${dscEmoji_id}> **Trio Flawless:** Deep Stone Crypt`);
          break;
        case dscTrio_id:
          trioArray.push(`<:${dscEmoji_name}:${dscEmoji_id}> **Trio:** Deep Stone Crypt`);
          break;
        case gosTrioF_id:
          trioArray.push(`<:${gosEmoji_name}:${gosEmoji_id}> **Trio Flawless:** Garden of Salvation`);
          break;
        case gosTrio_id:
          trioArray.push(`<:${gosEmoji_name}:${gosEmoji_id}> **Trio:** Garden of Salvation`);
          break;
        case gosDuo_id:
          duoArray.push(`<:${gosEmoji_name}:${gosEmoji_id}> **Duo:** Sanctified Mind`);
          break;
        case lwTrioF_id:
          trioArray.push(`<:${wishEmoji_name}:${wishEmoji_id}> **Trio Flawless:** Last Wish`);
          break;
        case lwTrio_id:
          trioArray.push(`<:${wishEmoji_name}:${wishEmoji_id}> **Trio:** Last Wish`);
          break;
        case lwDuo_id:
          duoArray.push(`<:${wishEmoji_name}:${wishEmoji_id}> **Duo:** Queenswalk`);
          break;
        case lwSolo_id:
          soloArray.push(`<:${wishEmoji_name}:${wishEmoji_id}> **Solo:** Queenswalk`);
          break;
        case crownTrioF_id:
          trioArray.push(`<:${crownEmoji_name}:${crownEmoji_id}> **Trio Flawless:** Crown of Sorrow`);
          break;
        case crownDuoF_id:
          duoArray.push(`<:${crownEmoji_name}:${crownEmoji_id}> **Duo Flawless:** Crown of Sorrow`);
          break;
        case scourgeTrioF_id:
          trioArray.push(`<:${scourgeEmoji_name}:${scourgeEmoji_id}> **Trio Flawless:** Scourge of the Past`);
          break;
        case scourgeDuo_id:
          duoArray.push(`<:${scourgeEmoji_name}:${scourgeEmoji_id}> **Duo:** Scourge of the Past`);
          break;
        case leviDuo_id:
          duoArray.push(`<:${leviEmoji_name}:${leviEmoji_id}> **Duo:** Calus`);
          break;
        case eowSolo_id:
          soloArray.push(`<:${leviEmoji_name}:${leviEmoji_id}> **Solo:** Argos`);
          break;
        case eowDuo_id:
          soloArray.push(`<:${leviEmoji_name}:${leviEmoji_id}> **Duo:** Argos`);
          break;
      }
    });

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${member.displayName}\`s Achievements:`, iconURL: `${member.displayAvatarURL()}` })
      .setColor(0xfa5c04)
      .addFields([
        {
          name: `**─ Solo ─**`,
          value: returnString(soloArray)

        },
        {
          name: `**─ Duo ─**`,
          value: returnString(duoArray)
        },
        {
          name: `**─ Trio ─**`,
          value: returnString(trioArray)
        }
      ]);

    await interaction.editReply({
      embeds: [embed]
    }).then(() => console.log(`Achievements Posted!`));
  }
};

function returnString(array) {
  if (array.length >= 1) {
    return array.join(`\n`);
  } else {
    return `N/A`;
  }
}
