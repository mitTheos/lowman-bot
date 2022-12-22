const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const bungieAPI = require("../../api/bungieAPI");
const raidReportAPI = require("../../api/raidReportAPI");
const User = require("../../schemas/user");
const { GUILD_ID, CHANNEL_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder().setName("announce").setDescription("Announce monthly Stats"), async execute(interaction, client) {
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);
    const channel = await guild.channels.fetch(CHANNEL_ID).catch(console.error);
    await interaction.deferReply({
      fetchReply: true
    });
    getData(async (users) => {
      console.log(users);
      getBest(users, async (best) => {
        console.log(best);
        const messageArray = [
          createMessage(users, best.lw.players, best.lw.activityTime, "Last Wish", "https://imgur.com/Vs3CemK.png"),
          createMessage(users, best.gos.players, best.gos.activityTime, "Garden of Salvation")
        ]
        for (const message of messageArray) {
          await channel.send(message).catch(console.error);
        }

        await interaction.editReply({
          content: `Announcement posted!`
        });
      });
    });
  }
};

function convertTime(time) {
  if (time === null || time === undefined) {
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

const getBest = (data, callback) => {
  let best = new Best();
  let counter = 0;
  for (const e of data) {
    getPb(e["d2MembershipId"], (pb) => {
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

getData = (callback) => {
  User.find({}, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      callback(result);
    }
  });
};

const getPb = (membershipId, callback) => {
  getInstances(membershipId, (hashcodeMap) => {
    addPlayers(hashcodeMap, (list) => {
      const pb = new Pb(membershipId, list[0], list[1]);
      callback(pb);
    });
  });
};

const getInstances = (membershipId, callback) => {
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

const addPlayers = async (hashcodeMap, callback) => {
  let lowmanList = [];
  let playerList = [];
  for (const instance of Array.from(hashcodeMap.keys())) {
    const lowmanListPromise = await getInstanceInfo(instance, hashcodeMap);
    lowmanListPromise.forEach((e) => lowmanList.push(e));
    lowmanListPromise.forEach((e) => e.players.forEach((f) => playerList.push(f)));

    //make players unique
    playerList = [...new Map(playerList.filter(Boolean).map(item =>
      [item["membershipId"], item])).values()];

    //make players in lowmanList unique
    lowmanList.forEach(lowman => {
      lowman.players = [...new Map(lowman.players.filter(Boolean).map(item =>
        [item["membershipId"], item])).values()];
    });
  }
  const returnList = [playerList, lowmanList];
  callback(returnList);
};

async function getInstanceInfo(instance, hashcodeMap) {
  let playersListMonthly = [];
  let lowmanListMonthly = [];
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
        const membershipId = entry["player"]["destinyUserInfo"]["membershipId"];
        playersListMonthly.push(new Player(`${name}#${tag}`, membershipId));
      }
      //speed times
      lowmanListMonthly.push(new Lowman(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], playersListMonthly, hashcodeMap.get(instance)));
    }
  });
  return lowmanListMonthly;
}

function createEmbed(raid, time, img) {
  return new EmbedBuilder({
    type: "rich", title: `Fastest ${raid}`, description: `Fastest lowman ${raid} last month`, color: 0x00FFFF, fields: [{
      name: convertTime(time), value: "\u200B"
    }], image: {
      url: `${img}`, height: 0, width: 0
    }
  });
}

function createContent(players) {
const users = getRegistered(players);

  let content;
  if (users.length < 1) {
    content = "no one cleared this raid this month";
  } else if (users.length === 1) {
    content = users[0] + " has the fastest clear";
  } else {
    let userString = users.slice(0, -1).join(', ')+' & '+users.slice(-1);
    content = userString + " have the fastest clear";
  }
  return content;
}

function getRegistered(players){
  let users = [];

  players.forEach((player) => {
    if (typeof player === "string") {
      users.push(`<@${player}>`);
    } else {
      users.push(player.name);
    }
  });
  return users;
}

function createMessage(users, players, activityTime, raidTitle, img) {
  const embed = createEmbed(raidTitle, activityTime, img);
  const content = createContent(getPlayerList(users, players));
  return { "content": content, embeds: [embed] }
}

function getPlayerList(users, players){
  const playerList = [];
  users.forEach((user) => {
    if(players !== undefined) {
      players.forEach((player) => {
        if (user["d2MembershipId"] === player.membershipId) {
          playerList.push(user["discordId"]);
        } else {
          playerList.push(player);
        }
      });
    }
  });
  return playerList;
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

  constructor(membershipId, playedUsersMonthly, lowmanList) {
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

    if (lowmanList != null) {
      lowmanList.forEach(lowman => {
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