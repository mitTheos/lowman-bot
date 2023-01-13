const bungieAPI = require("../../api/bungieAPI");
const raidReportAPI = require("../../api/raidReportAPI");

exports.getPlayedWith = (username, callback) => {
  getInstances(username, (returnList) => {
    //callback username in [0] and array of instances in [1]
    const username = returnList[0];
    const hashcodeMap = returnList[1];
    const instances = Array.from(hashcodeMap.keys());
    addPlayers(username, instances, hashcodeMap, (list) => {
      callback([list[0], list[1]]);
    });
  });
};

const addPlayers = async (username, instances, hashcodeMap, callback) => {
  let uniquePlayerList = [];
  let lowmanList = [];
  for (const instance of instances) {
    const lowmanListPromise = await getInstanceInfoThisMonth(instance, hashcodeMap);
    lowmanListPromise.forEach((e) => lowmanList.push(e));
    let playerList = [];
    lowmanListPromise.forEach((e) => e.players.forEach((f) => playerList.push(f)));
    // const playerList = lowmanList.players;
    for (const player of playerList) {
      //check if player is unique and that they are not the users whose data has been requested
      if (!uniquePlayerList.includes(player) && player !== username) {
        uniquePlayerList.push(player);
      }
    }
  }
  const returnList = [uniquePlayerList, lowmanList];
  callback(returnList);
};

async function getInstanceInfoThisMonth(instance, hashcodeMap) {
  let playersList = [];
  let lowmanList = [];
  await bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;
    //ISO dates
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() - 1);
    const dateOneMonthAgo = dateNow.toISOString();
    const instanceDate = response["period"];

    //only get data from instances that are a Month or less old
    if (dateOneMonthAgo <= instanceDate) {


      //players
      for (const entry of response.entries) {
        const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
        const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
        playersList.push(`${name}#${tag}`);
      }
      //speed times
      lowmanList.push(new Lowman(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], playersList, hashcodeMap.get(instance)));
    }
  });
  // lowmanList.forEach((e)=>console.log(e.printSpeed()));
  return lowmanList;
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
              if (lowman["fresh"] === true) {
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

class Lowman {
  instance;
  activityTime;
  players;
  raid;


  constructor(instance, activityTime, players, raid) {
    this.instance = instance;
    this.activityTime = activityTime;
    this.players = players;
    this.raid = raid;
  }

  printSpeed() {
    return `instance: ${this.instance}, activityTime: ${this.activityTime}, raid: ${this.raid}`;
  }
}

exports.MonthlyPB = class MonthlyPB {
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(lowmanList) {
    this.kf = null;
    this.vow = null;
    this.vog = null;
    this.dsc = null;
    this.gos = null;
    this.lw = null;


    lowmanList.forEach(lowman => {
      // kf
      if (lowman.raid === 1374392663) {
        if (this.kf > lowman.activityTime || this.kf == null) {
          this.kf = lowman.activityTime;
        }
      }
      // vow
      else if (lowman.raid === 1441982566) {
        if (this.vow > lowman.activityTime || this.vow == null) {
          this.vow = lowman.activityTime;
        }
      }
      // vog
      else if (lowman.raid === 3881495763) {
        if (this.vog > lowman.activityTime || this.vog == null) {
          this.vog = lowman.activityTime;
        }
      }
      // dsc
      else if (lowman.raid === 910380154) {
        if (this.dsc > lowman.activityTime || this.dsc == null) {
          this.dsc = lowman.activityTime;
        }
      }
      // gos1
      else if (lowman.raid === 3458480158) {
        if (this.gos > lowman.activityTime || this.gos == null) {
          this.gos = lowman.activityTime;
        }
      }
      // gos2
      else if (lowman.raid === 2659723068) {
        if (this.gos > lowman.activityTime || this.gos == null) {
          this.gos = lowman.activityTime;
        }
      }
      // lw
      else if (lowman.raid === 2122313384) {
        if (this.lw > lowman.activityTime || this.lw == null) {
          this.lw = lowman.activityTime;
        }
      }
    });
  }
}