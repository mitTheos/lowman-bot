const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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

    const embed = new EmbedBuilder()
      .setTitle("Lowman Bot registration")
      .setThumbnail("https://i.imgur.com/lhmYMyI.png")
      .addFields({
        name: "Authorize your Discord and Bungie account to register",
        value: `*You may also register multiple Bungie accounts to one Discord account if you wish to do so*`
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