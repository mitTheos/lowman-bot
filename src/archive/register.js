require('dotenv').config();
require("../api/lowmanVerifierAPI.js");
const { SlashCommandBuilder, GuildMemberRoleManager } = require("discord.js");
const api = require("../api/lowmanVerifierAPI");
const env = process.env;
const guildId = env.GUILD_ID;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("adds roles based on your rr")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Bungie name to lookup (with tag)")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const username = interaction.options.get("username").value;
    const guild = client.guilds.cache.get(guildId);

    //loading message
    const message = await interaction.deferReply({
      fetchReply: true
    });

    api.getLowmans(username).then((data)=>{
      addRoles(guild, data, interaction)
      interaction.editReply({
        content: `Roles added!`
      });
    });
  }
};

async function addRoles(guild, data, interaction) {
  const roleManager = await new GuildMemberRoleManager(interaction.member)

  const testRole = getRole(guild,"1045632540892991540");


  //add King's Fall roles
  if (data.kf["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIOKF_ID));
  if (data.kf["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWKF_ID));
  if (data.kf["lowest"] === 2) await roleManager.add([getRole(guild, env.DUOKF_ID), getRole(guild, env.TRIOKF_ID)]);

  //add Vow of the Disciple roles
  if (data.vow["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIOVOW_ID));
  if (data.vow["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWVOW_ID));

  //add Vault of Glass roles
  if (data.vog["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIOVOG_ID));
  if (data.vog["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWVOG_ID));
  if (data.vog["lowest"] === 2) await roleManager.add([getRole(guild, env.TRIOVOG_ID), getRole(guild, env.DUOVOG_ID)]);
  if (data.vog["lowestFlawless"] === 2) await roleManager.add([getRole(guild, env.TRIOFLAWVOG_ID), getRole(guild, env.DUOFLAWVOG_ID)]);

  //add Deep Stone Crypt roles
  if (data.dsc["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIODSC_ID));
  if (data.dsc["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWDSC_ID));
  if (data.dsc["lowest"] === 2) await roleManager.add([getRole(guild, env.TRIODSC_ID), getRole(guild, env.DUODSC_ID)]);
  if (data.dsc["lowestFlawless"] === 2) await roleManager.add([getRole(guild, env.TRIOFLAWDSC_ID), getRole(guild, env.DUOFLAWDSC_ID)]);

  //add Garden of Salvation roles
  if (data.gos["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIOGOS_ID));
  if (data.gos["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWGOS_ID));
  if (data.gos["lowest"] === 2) await roleManager.add([getRole(guild, env.TRIOGOS_ID), getRole(guild, env.DUOGOS_ID)]);

  //add Last Wish roles
  if (data.lw["lowest"] === 3) await roleManager.add(getRole(guild, env.TRIOLW_ID));
  if (data.lw["lowestFlawless"] === 3) await roleManager.add(getRole(guild, env.TRIOFLAWLW_ID));
  if (data.lw["lowest"] === 2) await roleManager.add([getRole(guild, env.TRIOLW_ID), getRole(guild, env.DUOLW_ID)]);
}

function getRole(guild, role){
  return guild.roles.cache.find(r => r.id === role);
}