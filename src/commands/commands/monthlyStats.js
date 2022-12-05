require("../../api/bungieAPI.js");
require("../../api/raidReportAPI.js");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI.js");
const raidReportAPI = require("../../api/raidReportAPI.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("monthly-stats")
    .setDescription("Return stats on the past month")
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
    getPlayedWith(username, (callback) => {
      const playedWithList = callback[0];
      const speedList = callback[1];
      const pb = new MonthlyPB(speedList);

      const embed = new EmbedBuilder()
        .setTitle("Players you've played with this month")
        .setColor(0x18e1ee)
        .addFields([
          {
            name: "Players",
            value: playedWithList.length.toString()
          }
        ]);
      const embed2 = new EmbedBuilder()
        .setTitle("Fastest lowmans this month")
        .setColor(0x18e1ee)
        .addFields([
          {
            name: "KF",
            value: convertTime(pb.kf),
            inline: true
          },
          {
            name: "VOW",
            value: convertTime(pb.vow),
            inline: true
          },
          {
            name: "VOG",
            value: convertTime(pb.vog),
            inline: true
          },
          {
            name: "DSC",
            value: convertTime(pb.dsc),
            inline: true
          },
          {
            name: "GOS",
            value: convertTime(pb.gos),
            inline: true
          },
          {
            name: "LW",
            value: convertTime(pb.lw),
            inline: true
          }
        ]);

      interaction.editReply({
        embeds: [embed, embed2]
      });
    });
  }
};

const getPlayedWith = (username, callback) => {
  getInstances(username, (returnList) => {
    //callback username in [0] and array of instances in [1]
    const username = returnList[0];
    const hashcodeMap = returnList[1];
    const instances = Array.from(hashcodeMap.keys());
    console.log(`instances: ${instances}`)
    addPlayers(username, instances, hashcodeMap, (list) => {
      const speedList = [];
      const instanceList = Array.from(list[1].keys());
      console.log(`instanceList ${instanceList}`)
      for (const instance of instanceList) {
        speedList.push.apply(speedList, list[1]);
      }
      callback([list[0], speedList]);
    });
  });
};

const addPlayers = async (username, instances, hashcodeMap, callback) => {
  let list = [];
  let speedList = [];
  for (const instance of instances) {
    console.log(`instance: ${instance}`)
    // instances still correct
    const instanceInfoPromise = await getInstanceInfoThisMonth(instance, hashcodeMap);
    const playerList = instanceInfoPromise[0];
    //TODO console.logs not triggering here
    speedList.forEach((e)=> console.log(e.instance))
    speedList.push.apply(instanceInfoPromise[1])
    for (const player of playerList) {
      //check if player is unique and not the users whose data has been requested
      if (!list.includes(player) && player !== username) {
        list.push(player);
      }
    }
  }
  const returnList = [list, speedList];
  speedList.forEach((e)=>console.log(e.printSpeed()));
  callback(returnList);
};

async function getInstanceInfoThisMonth(instance, hashcodeMap) {
  let playersList = [];
  let speedList = []
  await bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;
    //ISO dates
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() - 1);
    const dateOneMonthAgo = dateNow.toISOString();
    const instanceDate = response["period"];

    //only get data from instances that are a Month or less old
    if (dateOneMonthAgo <= instanceDate) {

      //speed times
      speedList.push(new Speed(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], hashcodeMap.get(instance)));

      //players
      for (const entry of response.entries) {
        const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
        const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
        playersList.push(`${name}#${tag}`);
      }
    }
  });
  return [playersList, speedList];
}

const getInstances = (username, callback) => {
  let instanceHashcodeMap = new Map();
  raidReportAPI.search(username).then((data) => {
    const membershipId = data.response[0]["membershipId"];
    const name = data.response[0]["bungieGlobalDisplayName"];
    const tag = data.response[0]["bungieGlobalDisplayNameCode"];
    const username = `${name}#${tag}`;

    raidReportAPI.raidStats(membershipId).then((data) => {
      const activities = data.response["activities"];

      if (activities != null) {
        for (const activity of activities) {
          const lowmans = activity["values"]["lowAccountCountActivities"];

          if (lowmans != null) {
            for (const lowman of lowmans) {
              if(lowman["fresh"] === true) {
                const instanceId = lowman["instanceId"];
                instanceHashcodeMap.set(instanceId, activity["activityHash"]);
              }
            }
          }
        }
      }
      const returnList = [username, instanceHashcodeMap];
      callback(returnList);
    });
  });
};

function convertTime(time) {
  if (time == null) {
    return "x";
  } else if (time / 3600 >= 1) {
    const hours = Math.floor(time / 3600);
    time = time - hours;
    const minutes = Math.floor((time - hours * 3600) / 60);
    const seconds = time - minutes * 60 - hours * 3600;
    return `${hours}h ${minutes}m ${seconds}s`;
  } else {
    const minutes = Math.floor((time) / 60);
    const seconds = time - minutes * 60;
    return `${minutes}m ${seconds}s`;
  }
}

class Speed {
  instance;
  activityTime;
  raid;


  constructor(instance, activityTime, raid) {
    this.instance = instance;
    this.activityTime = activityTime;
    this.raid = raid;
  }

  printSpeed(){
    return `instance: ${this.instance}, activityTime: ${this.activityTime}, raid: ${this.raid}`
  }
}

class MonthlyPB {
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(speedList) {
    this.kf = null;
    this.vow = null;
    this.vog = null;
    this.dsc = null;
    this.gos = null;
    this.lw = null;


    speedList.forEach(element => {
      // kf
      if (element.raid === 1374392663) {
        if (this.kf > element.activityTime || this.kf == null) {
          this.kf = element.activityTime;
        }
      }
      // vow
      else if (element.raid === 1441982566) {
        if (this.vow > element.activityTime || this.vow == null) {
          this.vow = element.activityTime;
        }
      }
      // vog
      else if (element.raid === 3881495763) {
        if (this.vog > element.activityTime || this.vog == null) {
          this.vog = element.activityTime;
        }
      }
      // dsc
      else if (element.raid === 910380154) {
        if (this.dsc > element.activityTime || this.dsc == null) {
          this.dsc = element.activityTime;
        }
      }
      // gos1
      else if (element.raid === 3458480158) {
        if (this.gos > element.activityTime || this.gos == null) {
          this.gos = element.activityTime;
        }
      }
      // gos2
      else if (element.raid === 2659723068) {
        if (this.gos > element.activityTime || this.gos == null) {
          this.gos = element.activityTime;
        }
      }
      // lw
      else if (element.raid === 2122313384) {
        if (this.lw > element.activityTime || this.lw == null) {
          this.lw = element.activityTime;
        }
      }
    });
  }
}