const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const {GUILDID, CHANNELID} = process.env;
module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("make an announcement"),
  async execute(interaction, client) {
    const guild = await client.guilds.fetch(GUILDID).catch(console.error);
    const channel = await guild.channels.fetch(CHANNELID).catch(console.error);

    const message = await interaction.deferReply({
      fetchReply: true
    });
    const embed = new EmbedBuilder({
      title: "Announcement",
      fields: [{
        name: "Announcement",
        value: "so real"
      }]
    });
    await channel.send({ embeds: [embed] }).catch(console.error);

    await interaction.editReply({
      content: "Announcement posted!"
      }
    );
  }
  }