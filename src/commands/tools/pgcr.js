require("../../api/bungieAPI.js");
const { SlashCommandBuilder } = require("discord.js");
const api = require("../../api/bungieAPI.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pgcr")
    .setDescription("Return pgcr")
    .addStringOption((option) =>
      option
        .setName("instance")
        .setDescription("Bungie instanceID")
        .setRequired(true)
    ),
  async execute(interaction, client) {

    const instanceId = interaction.options.get("instance").value;

    // loading message
    const message = await interaction.deferReply({
      fetchReply: true
    });

    api.getPGCR(instanceId).then((data) => {
      getPlayers(data.Response)
      // update message with embed
      // interaction.editReply({
      //   message: data["Response"]
      // });
    });
  }
};

function  getPlayers(response){
  for (const entry of response.entries){
    const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"]
    const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"]
    console.log(`${name}#${tag}`)
  }
}