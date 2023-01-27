const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

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
        value: `*Multiple Bungie accounts can be linked to a single Discord account.*`
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
