require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI.js");
const raidReportAPI = require("../../api/raidReportAPI.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("played-with")
    .setDescription("Return the People you have done lowmans with")
    .addStringOption((option) =>
      option
        .setName("username")
        .setDescription("Bungie username")
        .setRequired(true)
    ),
  async execute(interaction, client) {

    const username = interaction.options.get("username").value;

    // loading message
    const message = await interaction.deferReply({
      fetchReply: true
    });
    getPlayedWith(username, (playedWithList) => {
      console.log(`players: ${playedWithList}`)

      const embed = new EmbedBuilder()
        .setTitle("Lowman Stats")
        .setColor(0x18e1ee)
        .addFields([
          {
            name: "Number of unique players you've done lowmans with",
            value: playedWithList.length.toString(),
          },
          {
            name: "Players:",
            value: playedWithList.join(', '),
          },
          ])

      interaction.editReply({
        embeds: [embed]
      });
    })
  }
};

const getPlayedWith = (username, callback) =>{
  getInstances(username, (usernameAndInstances) =>{
    //callback username in [0] and array of instances in [1]
    addPlayers(usernameAndInstances[0], usernameAndInstances[1], (list)=>{
      callback(list)
    })
  })
}

 const addPlayers =async (username, instances, callback) =>{
  let list = []
  for(const instance of instances){
    const playerListPromise = await getPlayers(instance)
    for(const player of playerListPromise){
      if(!list.includes(player) && player !== username){
        list.push(player)
      }
    }
  }
  callback(list)
}

async function getPlayers(instance) {
  let playersList = [];
  await bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;
    for (const entry of response.entries) {
      const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
      const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
      playersList.push(`${name}#${tag}`);
    }
  });
  return playersList
}

const getInstances = (username, callback) => {
  const instanceList = []
  raidReportAPI.search(username).then((data) => {
    const membershipId = data.response[0]["membershipId"];
    const name = data.response[0]["bungieGlobalDisplayName"]
    const tag = data.response[0]["bungieGlobalDisplayNameCode"]
    const username = `${name}#${tag}`

    raidReportAPI.raidStats(membershipId).then((data) => {
      const activities = data.response["activities"];

      if (activities != null) {
        for (const activity of activities) {
          const lowmans = activity["values"]["lowAccountCountActivities"];

          if (lowmans != null) {
            for (const lowman of lowmans) {
              const instanceId = lowman["instanceId"]
              instanceList.push(instanceId)
            }
          }
        }
      }
      const nameAndList = [username, instanceList]
      callback(nameAndList)
    });
  });
}