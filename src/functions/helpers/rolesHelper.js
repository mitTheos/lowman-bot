const raidReportAPI = require("../../api/raidReportAPI");
const {
  legendF_id, masterF_id, kfTrio_id, kfTrioF_id, kfDuo_id, kfTrioMF_id, vowTrio_id, vowTrioF_id, vowTrioMF_id, vogTrio_id, vogTrioF_id, vogDuo_id, vogDuoF_id,
  vogTrioMF_id, vogDuoMF_id, vogSolo_id, dscTrio_id, dscTrioF_id, dscDuo_id, dscDuoF_id, gosTrio_id, gosTrioF_id, gosDuo_id, lwTrio_id, lwTrioF_id, lwDuo_id, lwSolo_id,
  eowSolo_id
} = require("./roles");

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
              if (flawless["fresh"] !== null) {
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
  getLowmans(membershipId, (lowmanArray) => {
    callback(new Player(membershipId, lowmanArray));
  });
};

exports.addRoles = async function addRoles(member, player, guild) {
  await exports.clearRoles(member, player, guild);

  const roleInit = new Roles();
  const roles = await roleInit.getRoles(guild);

  let promiseArray = [];
  //flawless
  if (player.kfMaster.flawCount === 3 && player.vowMaster.flawCount === 3 && player.vogMaster.flawCount === 2) {
   promiseArray.push(member.roles.add(roles.masterF).catch(console.error));
  }
  if (player.kf.flawCount === 3 && player.vow.flawCount === 3 && player.vog.flawCount === 2 && player.dsc.flawCount === 2 && player.gos.flawCount === 3 && player.lw.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.legendF).catch(console.error));
  }

  //kf
  if (player.kfMaster.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.kfTrioMF).catch(console.error));

    if (player.kf.normCount === 2) {
     promiseArray.push(member.roles.add(roles.kfDuo).catch(console.error));
    }
  } else if (player.kf.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.kfTrioF).catch(console.error));

    if (player.kf.normCount === 2) {
     promiseArray.push(member.roles.add(roles.kfDuo).catch(console.error));
    }
  } else if (player.kf.normCount === 2) {
   promiseArray.push(member.roles.add(roles.kfDuo).catch(console.error));
  } else if (player.kf.normCount === 3) {
   promiseArray.push(member.roles.add(roles.kfTrio).catch(console.error));
  }

  //vow
  if (player.vowMaster.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.vowTrioMF).catch(console.error));
  } else if (player.vow.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.vowTrioF).catch(console.error));
  } else if (player.vow.normCount === 3) {
   promiseArray.push(member.roles.add(roles.vowTrio).catch(console.error));
  }
  //vog
  if (player.vogMaster.flawCount === 2) {
   promiseArray.push(member.roles.add(roles.vogDuoMF).catch(console.error));

    if (player.vog.normCount === 1) {
     promiseArray.push(member.roles.add(roles.vogSolo).catch(console.error));
    }
  } else if (player.vogMaster === 3) {
   promiseArray.push(member.roles.add(roles.vogTrioMF).catch(console.error));

    if (player.vog.flawless === 2) {
     promiseArray.push(member.roles.add(roles.vogDuoF).catch(console.error));
    } else if (player.vog.normCount === 2) {
     promiseArray.push(member.roles.add(roles.vogDuo).catch(console.error));
    }
    if (player.vog.normCount === 1) {
     promiseArray.push(member.roles.add(roles.vogSolo).catch(console.error));
    }
  } else if (player.vog.flawCount === 2) {
   promiseArray.push(member.roles.add(roles.vogDuoF).catch(console.error));

    if (player.vog.normCount === 1) {
     promiseArray.push(member.roles.add(roles.vogSolo).catch(console.error));
    }
  } else if (player.vog.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.vogTrioF).catch(console.error));

    if (player.vog.normCount === 1) {
     promiseArray.push(member.roles.add(roles.vogSolo).catch(console.error));
    } else if (player.vog.normCount === 2) {
     promiseArray.push(member.roles.add(roles.vogDuo).catch(console.error));
    }
  } else if (player.vog.normCount === 1) {
   promiseArray.push(member.roles.add(roles.vogSolo).catch(console.error));
  } else if (player.vog.normCount === 2) {
   promiseArray.push(member.roles.add(roles.vogDuo).catch(console.error));
  } else if (player.vog.normCount === 3) {
   promiseArray.push(member.roles.add(roles.vogTrio).catch(console.error));
  }
  //dsc
  if (player.dsc.flawCount === 2) {
   promiseArray.push(member.roles.add(roles.dscDuoF).catch(console.error));
  } else if (player.dsc.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.dscTrioF).catch(console.error));
  }
  if (player.dsc.normCount < player.dsc.flawCount || player.dsc.flawCount === undefined) {
    if (player.dsc.normCount === 2) {
     promiseArray.push(member.roles.add(roles.dscDuo).catch(console.error));
    } else if (player.dsc.normCount === 3) {
     promiseArray.push(member.roles.add(roles.dscTrio).catch(console.error));
    }
  }
  //gos
  if (player.gos.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.gosTrioF).catch(console.error));
  }
  if (player.gos.normCount < player.gos.flawCount || player.gos.flawCount === undefined) {
    if (player.gos.normCount === 2) {
     promiseArray.push(member.roles.add(roles.gosDuo).catch(console.error));
    } else if (player.gos.normCount === 3) {
     promiseArray.push(member.roles.add(roles.gosTrio).catch(console.error));
    }
  }
  //lw
  if (player.lw.flawCount === 3) {
   promiseArray.push(member.roles.add(roles.lwTrioF).catch(console.error));

  }
  if (player.lw.normCount < player.lw.flawCount || player.lw.flawCount === undefined) {
    if (player.lw.normCount === 1) {
     promiseArray.push(member.roles.add(roles.lwSolo).catch(console.error));
    } else if (player.lw.normCount === 2) {
     promiseArray.push(member.roles.add(roles.lwDuo).catch(console.error));
    } else if (player.lw.normCount === 3) {
     promiseArray.push(member.roles.add(roles.lwTrio).catch(console.error));
    }
  }

  //eow
  if (player.eow.normCount === 1) {
   promiseArray.push(member.roles.add(roles.eowSolo).catch(console.error));
  }
  await Promise.all(promiseArray);
  console.log(`finished adding Roles for ${player.membershipId}`);
};

exports.clearRoles = async function clearRoles(member, player, guild) {
  const roleInit = new Roles();
  const roles = await roleInit.getRoles(guild);
  const roleArray = roles.getArray();
  
  //remove all roles
  let promiseArray = [];
  for (const role of roleArray) {
    promiseArray.push(member.roles.remove(role).catch(console.error));
  }
  await Promise.all(promiseArray);
  console.log(`finished removing Roles for ${player.membershipId}`);
};

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
  eow;

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
    this.eow = new Raid();

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
        // gos
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
          //eow
        // 3089205900 = norm, 809170886 = prestige
        else if (lowman.raid === 3089205900 || lowman.raid === 809170886) {
          if (lowman.playerCount === 1) {
            this.eow.normCount = 1;
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

class Roles {
  legendF;
  masterF;
  kfTrio;
  kfTrioF;
  kfDuo;
  kfTrioMF;
  vowTrio;
  vowTrioF;
  vowTrioMF;
  vogTrio;
  vogTrioF;
  vogDuo;
  vogDuoF;
  vogTrioMF;
  vogDuoMF;
  vogSolo;
  dscTrio;
  dscTrioF;
  dscDuo;
  dscDuoF;
  gosTrio;
  gosTrioF;
  gosDuo;
  lwTrio;
  lwTrioF;
  lwDuo;
  lwSolo;
  eowSolo;


  constructor(legendF, masterF, kfTrio, kfTrioF, kfDuo, kfTrioMF, vowTrio, vowTrioF, vowTrioMF, vogTrio, vogTrioF, vogDuo, vogDuoF, vogTrioMF, vogDuoMF, vogSolo, dscTrio, dscTrioF, dscDuo, dscDuoF, gosTrio, gosTrioF, gosDuo, lwTrio, lwTrioF, lwDuo, lwSolo, eowSolo) {
    this.legendF = legendF;
    this.masterF = masterF;
    this.kfTrio = kfTrio;
    this.kfTrioF = kfTrioF;
    this.kfDuo = kfDuo;
    this.kfTrioMF = kfTrioMF;
    this.vowTrio = vowTrio;
    this.vowTrioF = vowTrioF;
    this.vowTrioMF = vowTrioMF;
    this.vogTrio = vogTrio;
    this.vogTrioF = vogTrioF;
    this.vogDuo = vogDuo;
    this.vogDuoF = vogDuoF;
    this.vogTrioMF = vogTrioMF;
    this.vogDuoMF = vogDuoMF;
    this.vogSolo = vogSolo;
    this.dscTrio = dscTrio;
    this.dscTrioF = dscTrioF;
    this.dscDuo = dscDuo;
    this.dscDuoF = dscDuoF;
    this.gosTrio = gosTrio;
    this.gosTrioF = gosTrioF;
    this.gosDuo = gosDuo;
    this.lwTrio = lwTrio;
    this.lwTrioF = lwTrioF;
    this.lwDuo = lwDuo;
    this.lwSolo = lwSolo;
    this.eowSolo = eowSolo;
  }

  async getRoles(guild) {
    return new Roles(
      await guild.roles.fetch(legendF_id),
      await guild.roles.fetch(masterF_id),
      await guild.roles.fetch(kfTrio_id),
      await guild.roles.fetch(kfTrioF_id),
      await guild.roles.fetch(kfDuo_id),
      await guild.roles.fetch(kfTrioMF_id),
      await guild.roles.fetch(vowTrio_id),
      await guild.roles.fetch(vowTrioF_id),
      await guild.roles.fetch(vowTrioMF_id),
      await guild.roles.fetch(vogTrio_id),
      await guild.roles.fetch(vogTrioF_id),
      await guild.roles.fetch(vogDuo_id),
      await guild.roles.fetch(vogDuoF_id),
      await guild.roles.fetch(vogTrioMF_id),
      await guild.roles.fetch(vogDuoMF_id),
      await guild.roles.fetch(vogSolo_id),
      await guild.roles.fetch(dscTrio_id),
      await guild.roles.fetch(dscTrioF_id),
      await guild.roles.fetch(dscDuo_id),
      await guild.roles.fetch(dscDuoF_id),
      await guild.roles.fetch(gosTrio_id),
      await guild.roles.fetch(gosTrioF_id),
      await guild.roles.fetch(gosDuo_id),
      await guild.roles.fetch(lwTrio_id),
      await guild.roles.fetch(lwTrioF_id),
      await guild.roles.fetch(lwDuo_id),
      await guild.roles.fetch(lwSolo_id),
      await guild.roles.fetch(eowSolo_id)
    );
  }

  getArray() {
    return [
      this.legendF,
      this.masterF,
      this.kfTrio,
      this.kfTrioF,
      this.kfDuo,
      this.kfTrioMF,
      this.vowTrio,
      this.vowTrioF,
      this.vowTrioMF,
      this.vogTrio,
      this.vogTrioF,
      this.vogDuo,
      this.vogDuoF,
      this.vogTrioMF,
      this.vogDuoMF,
      this.vogSolo,
      this.dscTrio,
      this.dscTrioF,
      this.dscDuo,
      this.dscDuoF,
      this.gosTrio,
      this.gosTrioF,
      this.gosDuo,
      this.lwTrio,
      this.lwTrioF,
      this.lwDuo,
      this.lwSolo,
      this.eowSolo
    ];
  }
}