// get PB of all the registered users and
// collect the best times/the highest ppl played with and return them in a Best Object
const raidReportAPI = require("../../api/raidReportAPI");
const bungieAPI = require("../../api/bungieAPI");
const { EmbedBuilder } = require("discord.js");
const { convertTime } = require("./convertTime");
exports.getBest = (data, callback) => {
  let best = new exports.Best();
  let counter = 0;
  for (const e of data) {
    getPb(e["d2MembershipId"], (pb) => {
      //membership invalid?
      if (pb !== null) {
        console.log(`calculated pb for user Nr: ${counter} | MembershipId: ${pb.membershipId}`);
        if (pb.mentor.playerCount > best.mentor.playerCount || best.mentor.playerCount === undefined) {
          if (pb.mentor.playerCount !== undefined) {
            best.mentor = new Mentor(pb.mentor.name, pb.membershipId, pb.mentor.players, pb.mentor.playerCount);
          }
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
      }
    });
  }
};

// get the PB with all the data on the person with the membershipId
const getPb = (membershipId, callback) => {
  getInstances(membershipId, (hashcodeMap) => {
    //membership invalid?
    if (hashcodeMap.size !== 0) {
      addPlayers(membershipId, hashcodeMap, (array) => {
        const pb = new Pb(membershipId, array[0], array[1], array[2]);
        callback(pb);
      });
    }
  });
};

// get all the instances that were fresh lowmans from player with the membershipId
const getInstances = (membershipId, callback) => {
  // Map with (instanceId, activityHash)
  let instanceHashcodeMap = new Map();
  raidReportAPI.raidStats(membershipId).then((data) => {
    //membership invalid?
    if (data !== null) {

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
    }
  });
};

// return array of unique players the person played with
// and return the array of lowmans with the players also unique per instance
const addPlayers = async (id, hashcodeMap, callback) => {
  let lowmans = [];
  let players = [];
  let username = null;
  for (const instance of Array.from(hashcodeMap.keys())) {
    const promise = await getInstanceInfo(id, instance, hashcodeMap);
    username = promise[0];
    const lowmanArray = promise[1];
    lowmanArray.forEach((e) => lowmans.push(e));
    lowmanArray.forEach((e) => e.players.forEach((f) => players.push(f)));

    //make players unique
    players = [...new Map(players.filter(Boolean).map(item =>
      [item["membershipId"], item])).values()];

    //make players in lowmanArray unique
    lowmans.forEach(lowman => {
      lowman.players = [...new Map(lowman.players.filter(Boolean).map(item =>
        [item["membershipId"], item])).values()];
    });
  }
  const returnArray = [username, players, lowmans];
  callback(returnArray);
};

// get the speed times and the players from the instance
async function getInstanceInfo(id, instance, hashcodeMap) {
  let monthlyPlayers = [];
  let monthlyLowmans = [];
  let username;
  await bungieAPI.getPGCR(instance).then((data) => {
    const response = data.Response;

    // get dates
    const dateNow = new Date();
    dateNow.setMonth(dateNow.getMonth() - 1);
    const instanceISODate = response["period"];
    const instanceDate = new Date(instanceISODate);

    //only get data from instances that are in the prior month
    if (dateNow.getMonth() === instanceDate.getMonth()) {

      //players
      for (const entry of response.entries) {
        const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
        const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
        const membershipId = entry["player"]["destinyUserInfo"]["membershipId"];
        if (membershipId === id) {
          username = `${name}#${tag}`;
        }
        monthlyPlayers.push(new Player(`${name}#${tag}`, membershipId));
      }
      //speed times
      monthlyLowmans.push(new Lowman(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], monthlyPlayers, hashcodeMap.get(instance)));
    }
  });
  return [username, monthlyLowmans];
}

// create the embed for speed acknowledgement
function createEmbed(emoji, raidTitle, description, time, img) {

  return new EmbedBuilder({
    title: `${emoji} ${raidTitle} - Fastest Lowman (${exports.getMessageDate(-1)})`, description: description, color: 0xfa5c04, fields: [{
      name: `Time: ${convertTime(time)}`, value: "\u200B"
    }], image: {
      url: `${img}`, height: 0, width: 0
    }
  });
}

// create message with embed
exports.createRaidMessage = function createRaidMessage(players, activityTime, emoji, raidTitle, img) {
  let playerArray = [];
  if (players !== undefined) {
    players.forEach((player) => {
      playerArray.push(`${player.name}`);
    });
  }
  //format players if any1 cleared the raid this month
  let playersFormatted = null;
  if (playerArray.length >= 1) {
    playersFormatted = playerArray.slice(0, -1).join(", ") + " & " + playerArray.slice(-1);
  }

  let description = "No one completed the raid this month.";
  // add players to description of any1 has cleared this month
  if (playerArray.length >= 1) {
    playersFormatted = playerArray.slice(0, -1).join(", ") + " & " + playerArray.slice(-1);
    description = `Completed by: ${playersFormatted}!`;
  }

  const embed = createEmbed(emoji, raidTitle, description, activityTime, img);
  return { embeds: [embed] };
};

// create the message to acknowledge the player that played with the most, unique players this month
exports.createPlayersMessage = function createPlayersMessage(mentor, img) {
  return {
    embeds: [
      {
        title: `Mentor - Most players helped (${exports.getMessageDate(-1)})`,
        description: `Mentor: ${mentor.name}`,
        color: 0xfa5c04,
        fields: [
          {
            name: `Players:  ${mentor.playerCount}`,
            value: "\u200B"
          }
        ], image: {
          url: `${img}`, height: 0, width: 0
        }
      }
    ]
  };
};

// modifier = difference current date (0 = this month, 1 = next month (-1) = last month)
exports.getMessageDate = function getMessageDate(modifier) {
  const dateNow = new Date();
  // set the day of the month to 10 to avoid complications with months having different numbers of days
  // since we only need the month and year this does not affect the date
  dateNow.setDate(10);
  dateNow.setMonth(dateNow.getMonth() + modifier);
  return dateNow.toLocaleString("default", { month: "long", year: "numeric" });
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

class Mentor {
  name;
  membershipId;
  players;
  playerCount;


  constructor(name, membershipId, players, playerCount) {
    this.name = name;
    this.membershipId = membershipId;
    this.players = players;
    this.playerCount = playerCount;
  }
}

class Pb {
  membershipId;
  mentor;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(membershipId, username, playedUsersMonthly, lowmanArray) {
    this.membershipId = membershipId;
    let playerCount = null;
    if (playedUsersMonthly != null) {
      if (playedUsersMonthly.length > 1) {
        playerCount = playedUsersMonthly.length - 1;
      }
    } else {
      playerCount = null;
    }
    this.mentor = new Mentor(username, membershipId, playedUsersMonthly, playerCount);
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

exports.Best = class Best {
  mentor;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor() {
    this.mentor = new Mentor();
    this.kf = new Activity();
    this.vow = new Activity();
    this.vog = new Activity();
    this.dsc = new Activity();
    this.gos = new Activity();
    this.lw = new Activity();
  }
};