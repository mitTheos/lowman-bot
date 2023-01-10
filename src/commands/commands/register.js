require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder, EmbedBuilder, ComponentBuilder, ButtonBuilder, ActionRowBuilder } = require("discord.js");
const { ButtonStyle } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("register to Lowman Bot")
    .setDMPermission(false),
  async execute(interaction, client) {
    // loading message
    console.log("===Register===");
    await interaction.deferReply({
      fetchReply: true
    });

    const button = {
      label: "Register",
      url: "https://lowman.app",
      emoji: {
        id: null,
        name: `💀`
      }
    };

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel(`Register`)
          .setStyle(ButtonStyle.Link)
          .setEmoji(`💀`)
          .setURL(`https://lowman.app`)
      )

    const embed = new EmbedBuilder()
      .setTitle("Lowman Bot registration")
      .setThumbnail("https://i.imgur.com/nnDl6aZ.jpeg")
      .addFields({
        name: "Authorize your Discord and Bungie account to register",
        value:`*You may also register multiple Bungie accounts to one Discord account if you wish to do so*`
      })
      .setFooter({
        text: "https://lowman.app"
      })
      .setURL(`https://lowman.app`);

    await interaction.editReply({
      components: [row],
      embeds: [embed]
    }).then(console.log("Registration message posted!"));
  }
};