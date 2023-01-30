const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register your Bungie account with Lowman Bot.")
    .setDMPermission(false),
  async execute(interaction, client) {
    // loading message
    console.log("===Register===");
    await interaction.deferReply({
      fetchReply: true
    });

    const embed = new EmbedBuilder()
      .setTitle("Lowman Bot - Registration")
      .setThumbnail("https://i.imgur.com/lhmYMyI.png")
      .addFields({
        name: "Authorize your Discord and Bungie account to be registered.",
        value: `*After registering, please wait till you get a DM from the Bot. After that your roles should be automatically updated!*`
      })
      .setColor(0xfa5c04)
      .setFooter({
        text: `lowman.app`,
        iconURL: `https://i.imgur.com/lhmYMyI.png`
      })
      .setURL(`https://lowman.app`);

    await interaction.editReply({
      embeds: [embed]
    }).then(() => console.log("Registration message posted!"));
  }
};
