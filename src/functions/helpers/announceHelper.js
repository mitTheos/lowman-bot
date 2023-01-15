
// get PB of all the registered users and
// collect the best times/the highest ppl played with and return them in a Best Object
const raidReportAPI = require("../../api/raidReportAPI");
const bungieAPI = require("../../api/bungieAPI");
const { EmbedBuilder } = require("discord.js");
const { convertTime } = require("./convertTime");
 exports.getBest = (data, callback) => {
  let best = new Best();
  let counter = 0;
  for (const e of data) {
    getPb(e["d2MembershipId"], (pb) => {
      console.log(`calculated pb for ${pb.membershipId}`);
      if (pb.playedUsersCountMonthly > best.playedUsersCountMonthly[0]) {
        best.playedUsersCountMonthly = [pb.playedUsersCountMonthly, pb.membershipId];
        best.playedUsersMonthly = [pb.playedUsersMonthly, pb.membershipId];
      }
      if (pb.kf.activityTime < best.kf.activityTime || best.kf.activityTime === undefined) {
        if (pb.kf.activityTime !== undefined) {
          best.kf = new Activity(pb.kf.activityTime, pb.kf.players);
        }
      }
      if (pb.vow.activityTime < best.vow.activityTime || best.vow.activityTime === undefined) {
        if (pb.vow.activityTime !== undefined) {
          best.vow = new Activity(pb.vow.activityTime, pb.vow.players);
        }
      }
      if (pb.vog.activityTime < best.vog.activityTime || best.vog.activityTime === undefined) {
        if (pb.vog.activityTime !== undefined) {
          best.vog = new Activity(pb.vog.activityTime, pb.vog.players);
        }
      }
      if (pb.dsc.activityTime < best.dsc.activityTime || best.dsc.activityTime === undefined) {
        if (pb.dsc.activityTime !== undefined) {
          best.dsc = new Activity(pb.dsc.activityTime, pb.dsc.players);
        }
      }
      if (pb.gos.activityTime < best.gos.activityTime || best.gos.activityTime === undefined) {
        if (pb.gos.activityTime !== undefined) {
          best.gos = new Activity(pb.gos.activityTime, pb.gos.players);
        }
      }
      if (pb.lw.activityTime < best.lw.activityTime || best.lw.activityTime === undefined) {
        if (pb.lw.activityTime !== undefined) {
          best.lw = new Activity(pb.lw.activityTime, pb.lw.players);
        }
      }
      if (counter === data.length - 1) {
        callback(best);
      } else {
        counter++;
      }
    });
  }
};

// get the PB with all the data on the person with the membershipId
const getPb = (membershipId, callback) => {
  getInstances(membershipId, (hashcodeMap) => {
    addPlayers(hashcodeMap, (array) => {
      const pb = new Pb(membershipId, array[0], array[1]);
      callback(pb);
    });
  });
};

// get all the instances that were fresh lowmans from player with the membershipId
const getInstances = (membershipId, callback) => {
  // Map with (instanceId, activityHash)
  let instanceHashcodeMap = new Map();
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
    callback(instanceHashcodeMap);
  });
};

// return array of unique players the person played with
// and return the array of lowmans with the players also unique per instance
const addPlayers = async (hashcodeMap, callback) => {
  let lowmans = [];
  let players = [];
  for (const instance of Array.from(hashcodeMap.keys())) {
    const lowmanArrayPromise = await getInstanceInfo(instance, hashcodeMap);
    lowmanArrayPromise.forEach((e) => lowmans.push(e));
    lowmanArrayPromise.forEach((e) => e.players.forEach((f) => players.push(f)));

    //make players unique
    players = [...new Map(players.filter(Boolean).map(item =>
      [item["membershipId"], item])).values()];

    //make players in lowmanArray unique
    lowmans.forEach(lowman => {
      lowman.players = [...new Map(lowman.players.filter(Boolean).map(item =>
        [item["membershipId"], item])).values()];
    });
  }
  const returnArray = [players, lowmans];
  callback(returnArray);
};

// get the speed times and the players from the instance
async function getInstanceInfo(instance, hashcodeMap) {
  let monthlyPlayers = [];
  let monthlyLowmans = [];
  await bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;

    // get ISO dates
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
        const membershipId = entry["player"]["destinyUserInfo"]["membershipId"];
        monthlyPlayers.push(new Player(`${name}#${tag}`, membershipId));
      }
      //speed times
      monthlyLowmans.push(new Lowman(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], monthlyPlayers, hashcodeMap.get(instance)));
    }
  });
  return monthlyLowmans;
}

// create the embed for speed acknowledgement
function createEmbed(raid, time, img) {
  return new EmbedBuilder({
    title: `Fastest ${raid}`, description: `Fastest lowman ${raid} last month`, color: 0xfa5c04, fields: [{
      name: convertTime(time), value: "\u200B"
    }], image: {
      url: `${img}`, height: 0, width: 0
    }
  });
}

// create the message associated with the speed embed
function createContent(players) {
  const users = formatRegistered(players);
  let content;
  if (users.length < 1) {
    content = "no one cleared this raid this month";
  } else if (users.length === 1) {
    content = users[0] + " has the fastest clear";
  } else {
    let usersString = users.slice(0, -1).join(", ") + " & " + users.slice(-1);
    content = usersString + " have the fastest clear";
  }
  return content;
}

// format the player for output as discord message
// return discord tag with id if registered
// return bungie name if not
function formatRegistered(players) {
  let formattedPlayers = [];

  players.forEach((player) => {
    if (typeof player === "string") {
      formattedPlayers.push(`<@${player}>`);
    } else {
      formattedPlayers.push(player.name);
    }
  });
  return formattedPlayers;
}

// create message with embed and content
exports.createRaidMessage = function createRaidMessage(users, players, activityTime, raidTitle, img) {
  const embed = createEmbed(raidTitle, activityTime, img);
  const content = createContent(getRegistered(users, players));
  return { "content": content, embeds: [embed] };
}

// check db for a discordId associated with the Player
// return Player if they are not in the db
function getRegistered(users, players) {
  const checkedPlayers = [];
  if (players !== undefined) {
    players.forEach((player) => {
      let isRegistered = false;
      users.forEach((user) => {
        if (user["d2MembershipId"] === player.membershipId && isRegistered === false) {
          isRegistered = true;
          checkedPlayers.push(user["discordId"]);
        }
      });
      if (isRegistered === false) {
        checkedPlayers.push(player);
      }
    });
  }
  return checkedPlayers;
}

// create the message to acknowledge the player that played with the most unique players this month
exports.createPlayersMessage = function createPlayersMessage(users, bestPlayer, playerAmount) {
  let registeredUsers = getRegistered(users, [new Player(null, bestPlayer)]);
  let formattedRegisteredUsers = formatRegistered(registeredUsers);
  if (formattedRegisteredUsers.length === 1) {
    return {
      content: `${formattedRegisteredUsers[0]} is the best mentor`,
      embeds: [
        {
          title: `Players played with`,
          description: `Amount of unique players played with last month`,
          color: 0xfa5c04,
          fields: [
            {
              name: `Players: `,
              value: playerAmount
            }
          ]
        }
      ]
    };
  } else return { content: `error: Player not found` };
}


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
}

class Player {
  name;
  membershipId;

  constructor(name, membershipId) {
    this.name = name;
    this.membershipId = membershipId;
  }
}

class Activity {
  activityTime;
  players;

  constructor(activityTime, players) {
    this.activityTime = activityTime;
    this.players = players;
  }
}

class Pb {
  membershipId;
  playedUsersMonthly;
  playedUsersCountMonthly;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(membershipId, playedUsersMonthly, lowmanArray) {
    this.membershipId = membershipId;
    this.playedUsersMonthly = playedUsersMonthly;
    if (playedUsersMonthly != null) {
      if (playedUsersMonthly.length > 1) {
        this.playedUsersCountMonthly = playedUsersMonthly.length - 1;
      }
    } else {
      this.playedUsersCountMonthly = null;
    }
    this.kf = new Activity();
    this.vow = new Activity();
    this.vog = new Activity();
    this.dsc = new Activity();
    this.gos = new Activity();
    this.lw = new Activity();

    if (lowmanArray != null) {
      lowmanArray.forEach(lowman => {
        // kf
        if (lowman.raid === 1374392663) {
          if (this.kf.activityTime > lowman.activityTime || this.kf.activityTime === undefined) {
            this.kf = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // vow
        else if (lowman.raid === 1441982566) {
          if (this.vow.activityTime > lowman.activityTime || this.vow.activityTime === undefined) {
            this.vow = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // vog
        else if (lowman.raid === 3881495763) {
          if (this.vog.activityTime > lowman.activityTime || this.vog.activityTime === undefined) {
            this.vog = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // dsc
        else if (lowman.raid === 910380154) {
          if (this.dsc.activityTime > lowman.activityTime || this.dsc.activityTime === undefined) {
            this.dsc = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // gos1
        else if (lowman.raid === 3458480158) {
          if (this.gos.activityTime > lowman.activityTime || this.gos.activityTime === undefined) {
            this.gos = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // gos2
        else if (lowman.raid === 2659723068) {
          if (this.gos.activityTime > lowman.activityTime || this.gos.activityTime === undefined) {
            this.gos = new Activity(lowman.activityTime, lowman.players);
          }
        }
        // lw
        else if (lowman.raid === 2122313384) {
          if (this.lw.activityTime > lowman.activityTime || this.lw.activityTime === undefined) {
            this.lw = new Activity(lowman.activityTime, lowman.players);
          }
        }
      });
    }
  }
}

class Best {
  playedUsersMonthly;
  playedUsersCountMonthly;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor() {
    this.playedUsersMonthly = [null, null];
    this.playedUsersCountMonthly = [null, null];
    this.kf = new Activity();
    this.vow = new Activity();
    this.vog = new Activity();
    this.dsc = new Activity();
    this.gos = new Activity();
    this.lw = new Activity();
  }
}