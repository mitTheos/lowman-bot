require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI.js");
const raidReportAPI = require("../../api/raidReportAPI.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("playedwith")
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
      console.log(`main: ${playedWithList}`)
    })
  }
};

const getPlayedWith = (username, callback) =>{
  getInstances(username, (instances) =>{
    addPlayers(instances).then(r => callback(r))
    console.log("3")
  })
  console.log("4")
}

async function addPlayers(instances){
  let list = []
  for(const instance of instances){
    await getPlayers(instance, (players) => {
      list.push(players)
      console.log("1")
    })
  }
  return list
}

const getPlayers = (instance, callback) => {
  let playersList = [];
  bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;
    for (const entry of response.entries) {
      const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
      const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
      // console.log(`${name}#${tag}`);
      playersList += `${name}#${tag}`;
    }
    callback(playersList)
  });
}

const getInstances = (username, callback) => {
  const instanceList = []
  raidReportAPI.search(username).then((data) => {
    const membershipId = data.response[0]["membershipId"];

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
      // console.log(`before return: ${instanceList}`)
      callback(instanceList)
    });
  });
}