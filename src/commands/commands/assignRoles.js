const { SlashCommandBuilder } = require("discord.js");
const raidReportAPI = require("../../api/raidReportAPI");
const User = require("../../schemas/user");
const { PermissionFlagsBits } = require("discord-api-types/v10");
const { GUILD_ID } = process.env;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("assign-roles")
    .setDescription("Assign Lowman Roles based on lowman clears")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  async execute(interaction, client) {

    // get Guild
    const guild = await client.guilds.fetch(GUILD_ID).catch(console.error);

    // loading message
    console.log("===Assign Roles===");
    await interaction.deferReply({
      fetchReply: true
    });

    // processing command
    console.log("getting data for assignment...");
    getData(async (users) => {
      console.log("db data received, calculating roles...");

      for (const user of users) {
        getPlayer(user["d2MembershipId"], async (player) => {
          const member = await guild.members.fetch(user["discordId"]);
          await addRoles(member, player, guild);
        });
      }
    });
    await interaction.editReply({
      content: `Roles assigned!`
    });
    console.log("Roles assigned!");
  }
};

// retrieve data from DB
getData = (callback) => {
  User.find({}, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      callback(result);
    }
  });
};

// get the Player with the membershipId
const getPlayer = (membershipId, callback) => {
  console.log(`adding roles for: ${membershipId}`);
  getLowmans(membershipId, (lowmanArray) => {
    callback(new Player(membershipId, lowmanArray));
  });
};

//get all lowman instances
const getLowmans = (membershipId, callback) => {
  let lowmanArray = [];
  raidReportAPI.raidStats(membershipId).then((data) => {
    const activities = data.response["activities"];

    if (activities != null) {
      for (const activity of activities) {
        const lowmans = activity["values"]["lowAccountCountActivities"];
        const flawlesses = activity["values"]["flawlessActivities"];

        if (flawlesses != null) {
          for (const flawless of flawlesses) {
            if (flawless["accountCount"] <= 3) {
              lowmanArray.push(new Lowman(flawless["instanceId"], flawless["accountCount"], true, activity["activityHash"]));
            }
          }
        }

        if (lowmans != null) {
          for (const lowman of lowmans) {
            //check if there is already a flawless with that instance
            const index = lowmanArray.findIndex(x => x.instance === lowman["instanceId"]);
            index === -1 ? lowmanArray.push(new Lowman(lowman["instanceId"], lowman["accountCount"], false, activity["activityHash"])) : null;
          }
        }
      }
    }
    callback(lowmanArray);
  });
};

async function addRoles(member, player, guild) {
  //kf
  const kfTrio = await guild.roles.fetch(`1063101506917765191`);
  const kfTrioF = await guild.roles.fetch(`1063101543575978074`);
  const kfDuo = await guild.roles.fetch(`1063101578623582270`);

  //vow
  const vowTrio = await guild.roles.fetch(`1063101620889604267`);
  const vowTrioF = await guild.roles.fetch(`1063101662794883132`);

  //Vog
  const vogTrio = await guild.roles.fetch(`1063056843594805278`);
  const vogTrioF = await guild.roles.fetch(`1063056885080657993`);
  const vogDuo = await guild.roles.fetch(`1063056947189911602`);
  const vogDuoF = await guild.roles.fetch(`1063056975325315102`);

  //dsc
  const dscTrio = await guild.roles.fetch(`1063101719250215013`);
  const dscTrioF = await guild.roles.fetch(`1063101778922569798`);
  const dscDuo = await guild.roles.fetch(`1063101808274321438`);
  const dscDuoF = await guild.roles.fetch(`1063101838276186112`);

  //gos
  const gosTrio = await guild.roles.fetch(`1063101882739990599`);
  const gosTrioF = await guild.roles.fetch(`1063101959546089502`);
  const gosDuo = await guild.roles.fetch(`1063101994136518698`);

  //lw
  const lwTrio = await guild.roles.fetch(`1063102039363702895`);
  const lwTrioF = await guild.roles.fetch(`1063102087673679882`);
  const lwDuo = await guild.roles.fetch(`1063102121035186186`);


  //kf
  if (player.kf.flawCount === 3) {
    member.roles.add(kfTrioF);
  }
  if (player.kf.normCount < player.kf.flawCount || player.kf.flawCount === undefined) {
    if (player.kf.normCount === 2) {
      member.roles.add(kfDuo);
    } else if (player.kf.normCount === 3) {
      member.roles.add(kfTrio);
    }
  }

  //vow
  if (player.vow.flawCount === 3) {
    member.roles.add(vowTrioF);
  }
  if (player.vow.flawCount === undefined) {
    if (player.vow.normCount === 3) {
      member.roles.add(vowTrio);
    }
  }

  //vog
  if (player.vog.flawCount === 2) {
    member.roles.add(vogDuoF);
  } else if (player.vog.flawCount === 3) {
    member.roles.add(vogTrioF);
  }
  if (player.vog.normCount < player.vog.flawCount || player.vog.flawCount === undefined) {
    if (player.vog.normCount === 2) {
      member.roles.add(vogDuo);
    } else if (player.vog.normCount === 3) {
      member.roles.add(vogTrio);
    }
  }

  //dsc
  if (player.dsc.flawCount === 2) {
    member.roles.add(dscDuoF);
  } else if (player.dsc.flawCount === 3) {
    member.roles.add(dscTrioF);
  }
  if (player.dsc.normCount < player.dsc.flawCount || player.dsc.flawCount === undefined) {
    if (player.dsc.normCount === 2) {
      member.roles.add(dscDuo);
    } else if (player.dsc.normCount === 3) {
      member.roles.add(dscTrio);
    }
  }

  //gos
  if (player.gos.flawCount === 3) {
    member.roles.add(gosTrioF);
  }
  if (player.gos.normCount < player.gos.flawCount || player.gos.flawCount === undefined) {
    if (player.gos.normCount === 2) {
      member.roles.add(gosDuo);
    } else if (player.gos.normCount === 3) {
      member.roles.add(gosTrio);
    }
  }

  //lw
  if (player.lw.flawCount === 3) {
    member.roles.add(lwTrioF);
  }
  if (player.lw.normCount < player.lw.flawCount || player.lw.flawCount === undefined) {
    if (player.lw.normCount === 2) {
      member.roles.add(lwDuo);
    } else if (player.lw.normCount === 3) {
      member.roles.add(lwTrio);
    }
  }
  console.log(`finished adding Roles for ${player.membershipId}`);
}

class Lowman {
  instance;
  playerCount;
  flawless;
  raid;


  constructor(instance, playerCount, flawless, raid) {
    this.instance = instance;
    this.playerCount = playerCount;
    this.flawless = flawless;
    this.raid = raid;
  }
}

class Player {
  membershipId;
  kf;
  vow;
  vog;
  dsc;
  gos;
  lw;

  constructor(membershipId, lowmans) {
    this.membershipId = membershipId;
    this.kf = new Raid();
    this.vow = new Raid();
    this.vog = new Raid();
    this.dsc = new Raid();
    this.gos = new Raid();
    this.lw = new Raid();

    if (lowmans != null) {
      lowmans.forEach(lowman => {
        // kf
        if (lowman.raid === 1374392663) {
          if (this.kf.normCount > lowman.playerCount || this.kf.normCount === undefined) {
            this.kf.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.kf.flawCount > lowman.playerCount || this.kf.flawCount === undefined) {
              this.kf.flawCount = lowman.playerCount;
            }
          }
        }
        // vow
        else if (lowman.raid === 1441982566) {
          if (this.vow.normCount > lowman.playerCount || this.vow.normCount === undefined) {
            this.vow.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.vow.flawCount > lowman.playerCount || this.vow.flawCount === undefined) {
              this.vow.flawCount = lowman.playerCount;
            }
          }
        }
        // vog
        else if (lowman.raid === 3881495763) {
          if (this.vog.normCount > lowman.playerCount || this.vog.normCount === undefined) {
            this.vog.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.vog.flawCount > lowman.playerCount || this.vog.flawCount === undefined) {
              this.vog.flawCount = lowman.playerCount;
            }
          }
        }
        // dsc
        else if (lowman.raid === 910380154) {
          if (this.dsc.normCount > lowman.playerCount || this.dsc.normCount === undefined) {
            this.dsc.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.dsc.flawCount > lowman.playerCount || this.dsc.flawCount === undefined) {
              this.dsc.flawCount = lowman.playerCount;
            }
          }
        }
        // gos1
        else if (lowman.raid === 3458480158 || lowman.raid === 2659723068) {
          if (this.gos.normCount > lowman.playerCount || this.gos.normCount === undefined) {
            this.gos.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.gos.flawCount > lowman.playerCount || this.gos.flawCount === undefined) {
              this.gos.flawCount = lowman.playerCount;
            }
          }
        }
        // lw
        else if (lowman.raid === 2122313384) {
          if (this.lw.normCount > lowman.playerCount || this.lw.normCount === undefined) {
            this.lw.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.lw.flawCount > lowman.playerCount || this.lw.flawCount === undefined) {
              this.lw.flawCount = lowman.playerCount;
            }
          }
        }
      });
    }
  }
}

class Raid {
  normCount;
  flawCount;

  constructor(normCount, flawCount) {
    this.normCount = normCount;
    this.flawCount = flawCount;
  }
}