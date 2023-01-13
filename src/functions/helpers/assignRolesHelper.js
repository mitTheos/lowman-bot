const raidReportAPI = require("../../api/raidReportAPI");

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
              if (flawless["fresh"] === true) {
                lowmanArray.push(new Lowman(flawless["instanceId"], flawless["accountCount"], true, activity["activityHash"]));
              }
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

exports.getPlayer = (membershipId, callback) => {
  console.log(`adding roles for ${membershipId}`);
  getLowmans(membershipId, (lowmanArray) => {
    callback(new Player(membershipId, lowmanArray));
  });
};

exports.addRoles = async function addRoles(member, player, guild) {
  //kf
  const kfTrio = await guild.roles.fetch(`1063101506917765191`);
  const kfTrioF = await guild.roles.fetch(`1063101543575978074`);
  const kfDuo = await guild.roles.fetch(`1063101578623582270`);
  const kfTrioMF = await guild.roles.fetch(`1063375357689995315`);

  //vow
  const vowTrio = await guild.roles.fetch(`1063101620889604267`);
  const vowTrioF = await guild.roles.fetch(`1063101662794883132`);
  const vowTrioMF = await guild.roles.fetch(`1063375418947797002`);

  //Vog
  const vogTrio = await guild.roles.fetch(`1063056843594805278`);
  const vogTrioF = await guild.roles.fetch(`1063056885080657993`);
  const vogDuo = await guild.roles.fetch(`1063056947189911602`);
  const vogDuoF = await guild.roles.fetch(`1063056975325315102`);
  const vogTrioMF = await guild.roles.fetch(`1063375456683962428`);
  const vogDuoMF = await guild.roles.fetch(`1063375498987700274`);

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
  if (player.kfMaster.flawCount === 3) {
    member.roles.add(kfTrioMF);

    if (player.kf.normCount === 2) {
      member.roles.add(kfDuo);
    }
  } else if (player.kf.flawCount === 3) {
    member.roles.add(kfTrioF);

    if (player.kf.normCount === 2) {
      member.roles.add(kfDuo);
    }
  } else if (player.kf.normCount === 2) {
    member.roles.add(kfDuo);
  } else if (player.kf.normCount === 3) {
    member.roles.add(kfTrio);
  }

  //vow
  if (player.vowMaster.flawCount === 3) {
    member.roles.add(vowTrioMF);
  } else if (player.vow.flawCount === 3) {
    member.roles.add(vowTrioF);
  } else if (player.vow.normCount === 3) {
    member.roles.add(vowTrio);
  }
  //vog
  if (player.vogMaster.flawCount === 2) {
    member.roles.add(vogDuoMF);
  } else if (player.vogMaster === 3) {
    member.roles.add(vogTrioMF);

    if (player.vog.flawless === 2) {
      member.roles.add(vogDuoF);
    } else if (player.vog.normCount === 2) {
      member.roles.add(vogDuo);
    }
  } else if (player.vog.flawCount === 2) {
    member.roles.add(vogDuoF);
  } else if (player.vog.flawCount === 3) {
    member.roles.add(vogTrioF);

    if (player.vog.normCount === 2) {
      member.roles.add(vogDuo);
    }
  } else if (player.vog.normCount === 2) {
    member.roles.add(vogDuo);
  } else if (player.vog.normCount === 3) {
    member.roles.add(vogTrio);
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
  kfMaster;
  vow;
  vowMaster;
  vog;
  vogMaster;
  dsc;
  gos;
  lw;

  constructor(membershipId, lowmans) {
    this.membershipId = membershipId;
    this.kf = new Raid();
    this.kfMaster = new Raid();
    this.vow = new Raid();
    this.vowMaster = new Raid();
    this.vog = new Raid();
    this.vogMaster = new Raid();
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
        // kf Master
        if (lowman.raid === 2964135793) {
          if (this.kfMaster.normCount > lowman.playerCount || this.kfMaster.normCount === undefined) {
            this.kfMaster.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.kfMaster.flawCount > lowman.playerCount || this.kfMaster.flawCount === undefined) {
              this.kfMaster.flawCount = lowman.playerCount;
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
        // vow Master
        else if (lowman.raid === 4217492330) {
          if (this.vowMaster.normCount > lowman.playerCount || this.vowMaster.normCount === undefined) {
            this.vowMaster.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.vowMaster.flawCount > lowman.playerCount || this.vowMaster.flawCount === undefined) {
              this.vowMaster.flawCount = lowman.playerCount;
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
        // vog Master
        else if (lowman.raid === 1681562271) {
          if (this.vogMaster.normCount > lowman.playerCount || this.vogMaster.normCount === undefined) {
            this.vogMaster.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.vogMaster.flawCount > lowman.playerCount || this.vogMaster.flawCount === undefined) {
              this.vogMaster.flawCount = lowman.playerCount;
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