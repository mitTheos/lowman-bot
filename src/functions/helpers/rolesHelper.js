const raidReportAPI = require("../../api/raidReportAPI");
const {
  legendF_id, masterF_id, kfTrio_id, kfTrioF_id, kfDuo_id, kfTrioMF_id, vowTrio_id, vowTrioF_id, vowTrioMF_id, vogTrio_id, vogTrioF_id, vogDuo_id, vogDuoF_id,
  vogTrioMF_id, vogDuoMF_id, vogSolo_id, dscTrio_id, dscTrioF_id, dscDuo_id, dscDuoF_id, gosTrio_id, gosTrioF_id, gosDuo_id, lwTrio_id, lwTrioF_id, lwDuo_id, lwSolo_id,
  eowSolo_id, mentor_id, fast_id, eowDuo_id, leviDuo_id, scourgeTrioF_id, scourgeDuo_id, crownDuoF_id, crownTrioF_id
} = require("../../config/roles");
const { getDataWithId } = require("./db");
const { guild_id } = require("../../config/guild");

exports.dmArray = dmArray = [];

sendDM = async function sendDM(member, addRoles, removeRoles) {
  if (addRoles.length >= 1) {
    await dm(member, addRoles, "added");
  }
  if (removeRoles.length >= 1) {
    await dm(member, removeRoles, "removed");
  }
};

async function dm(member, array, action){
  let rolesArray = [];
  array.forEach(role =>{
    rolesArray.push(role["name"]);
  });
  const rolesString = rolesArray.join(", ");
  if(array.length === 1){
    member.send(`> \`The role: ${rolesString} was ${action}.\``);
  }else{
    member.send(`> \`The roles: ${rolesString} were ${action}.\``);
  }
}

//TODO whole Monthly role auto-assign needs review
exports.getMonthlyIds = function getMonthlyIds(users, best) {
  let monthlyRoles = new MonthlyRoles(null, []);
  let playerArray = [...best?.kf?.players, ...best?.lw?.players];
  users.forEach((user) => {
    if (best.mentor.membershipId === user["d2MembershipId"]) {
      monthlyRoles.mentorId = user["discordId"];
    }
    if (playerArray?.some(player => player.membershipId === user["d2MembershipId"])) {
      monthlyRoles.fastIds.push(user["discordId"]);
    }
  });
  return monthlyRoles;
};

exports.assignMonthlyRoles = async function assignMonthlyRoles(guild, monthlyRoles) {
  //TODO check if this works to remove roles from previous month
  const members = await guild.members.cache;
  for (const member of members) {
    if (member.roles) {
      await member.roles.remove(mentor_id);
      await member.roles.remove(fast_id);
    }
  }

  const mentor = await guild.members.fetch(monthlyRoles.mentorId);
  await mentor.roles.add(mentor_id);
  for (const id of monthlyRoles.fastIds) {
    const fast = await guild.members.fetch(id);
    await fast.roles.add(fast_id);
  }
};

//if add = false => clear Roles of member
//if add = true => clear & add roles
exports.updateRoles = async function updateRoles(add, reply, interaction, client, member) {
  try {
    const guild = await client.guilds.fetch(guild_id).catch(console.error);

    const discordId = await member.id;
    getDataWithId(discordId, async (user) => {
      //not registered
      if (user === null || user["d2MembershipId"] === undefined) {
        await interaction.editReply({
          content: `User not registered! Use /register to register with the Bot`
        }).then(() => console.log(`User (id: ${member.id})not registered!`));
      } else {
        getPlayer(user["d2MembershipId"], async (player) => {
          if (add === true) {
            await addRoles(member, player, guild);
          } else if (add === false) {
            await clearRoles(member, player, guild);
          }

          await interaction.editReply({
            content: reply
          }).then(() => console.log(reply));
        });
      }
    });
  } catch (ex) {
    await interaction.editReply({
      content: "An error occurred, the command failed to complete!"
    }).then(() => console.error(ex));
  }
};

//get all lowman instances
const getLowmans = (membershipId, callback) => {
  let lowmanArray = [];
  raidReportAPI.raidStats(membershipId).then((data) => {
    if (data !== null) {
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
    }
  });
};

exports.getPlayer = getPlayer = (membershipId, callback) => {
  getLowmans(membershipId, (lowmanArray) => {
    callback(new Player(membershipId, lowmanArray));
  });
};

exports.addRoles = addRoles = async function addRoles(member, player, guild) {
  const roleInit = new Roles();
  const roles = await roleInit.getRoles(guild);
  const allRoles = roles.getArray();
  const newRoles = [];

  //flawless mastery
  if (player.kfMaster.flawCount === 3 && player.vowMaster.flawCount === 3 && player.vogMaster.flawCount === 2) {
    newRoles.push(roles.masterF);
  }
  if (player.kf.flawCount === 3 && player.vow.flawCount === 3 && player.vog.flawCount === 2 && player.dsc.flawCount === 2 && player.gos.flawCount === 3 && player.lw.flawCount === 3) {
    newRoles.push(roles.legendF);
  }

  //kf
  if (player.kfMaster.flawCount === 3) {
    newRoles.push(roles.kfTrioMF);

    if (player.kf.normCount === 2) {
      newRoles.push(roles.kfDuo);
    }
  } else if (player.kf.flawCount === 3) {
    newRoles.push(roles.kfTrioF);

    if (player.kf.normCount === 2) {
      newRoles.push(roles.kfDuo);
    }
  } else if (player.kf.normCount === 2) {
    newRoles.push(roles.kfDuo);
  } else if (player.kf.normCount === 3) {
    newRoles.push(roles.kfTrio);
  }

  //vow
  if (player.vowMaster.flawCount === 3) {
    newRoles.push(roles.vowTrioMF);
  } else if (player.vow.flawCount === 3) {
    newRoles.push(roles.vowTrioF);
  } else if (player.vow.normCount === 3) {
    newRoles.push(roles.vowTrio);
  }
  //vog
  if (player.vogMaster.flawCount === 2) {
    newRoles.push(roles.vogDuoMF);

    if (player.vog.normCount === 1) {
      newRoles.push(roles.vogSolo);
    }
  } else if (player.vogMaster.flawCount === 3) {
    newRoles.push(roles.vogTrioMF);

    if (player.vog.flawCount === 2) {
      newRoles.push(roles.vogDuoF);
    } else if (player.vog.normCount === 2) {
      newRoles.push(roles.vogDuo);
    }
    if (player.vog.normCount === 1) {
      newRoles.push(roles.vogSolo);
    }
  } else if (player.vog.flawCount === 2) {
    newRoles.push(roles.vogDuoF);
    if (player.vog.normCount === 1) {
      newRoles.push(roles.vogSolo);
    }
  } else if (player.vog.flawCount === 3) {
    newRoles.push(roles.vogTrioF);

    if (player.vog.normCount === 1) {
      newRoles.push(roles.vogSolo);
    } else if (player.vog.normCount === 2) {
      newRoles.push(roles.vogDuo);
    }
  } else if (player.vog.normCount === 1) {
    newRoles.push(roles.vogSolo);
  } else if (player.vog.normCount === 2) {
    newRoles.push(roles.vogDuo);
  } else if (player.vog.normCount === 3) {
    newRoles.push(roles.vogTrio);
  }
  //dsc
  if (player.dsc.flawCount === 2) {
    newRoles.push(roles.dscDuoF);
  } else if (player.dsc.flawCount === 3) {
    newRoles.push(roles.dscTrioF);
  }
  if (player.dsc.normCount < player.dsc.flawCount || player.dsc.flawCount === undefined) {
    if (player.dsc.normCount === 2) {
      newRoles.push(roles.dscDuo);
    } else if (player.dsc.normCount === 3) {
      newRoles.push(roles.dscTrio);
    }
  }
  //gos
  if (player.gos.flawCount === 3) {
    newRoles.push(roles.gosTrioF);
  }
  if (player.gos.normCount < player.gos.flawCount || player.gos.flawCount === undefined) {
    if (player.gos.normCount === 2) {
      newRoles.push(roles.gosDuo);
    } else if (player.gos.normCount === 3) {
      newRoles.push(roles.gosTrio);
    }
  }
  //lw
  if (player.lw.flawCount === 3) {
    newRoles.push(roles.lwTrioF);
  }
  if (player.lw.normCount < player.lw.flawCount || player.lw.flawCount === undefined) {
    if (player.lw.normCount === 1) {
      newRoles.push(roles.lwSolo);
    } else if (player.lw.normCount === 2) {
      newRoles.push(roles.lwDuo);
    } else if (player.lw.normCount === 3) {
      newRoles.push(roles.lwTrio);
    }
  }

  //eow
  if (player.eow.normCount === 1) {
    newRoles.push(roles.eowSolo);
  } else if (player.eow.normCount === 2) {
    newRoles.push(roles.eowDuo);
  }
  //levi
  if (player.levi.normCount === 2) {
    newRoles.push(roles.leviDuo);
  }

  //scourge
  if (player.scourge.normCount === 2) {
    newRoles.push(roles.scourgeDuo);
  }
  if (player.scourge.flawCount === 3) {
    newRoles.push(roles.scourgeTrioF);
  }

  //cos
  if (player.cos.flawCount === 2) {
    newRoles.push(roles.cosDuoF);
  } else if (player.cos.flawCount === 3) {
    newRoles.push(roles.cosTrioF);
  }

  //convert tempMemberRoles format [roleID, role] =>  to [role]
  const tempMemberRoles = Array.from(await member.roles.cache);
  let memberRoles = [];
  tempMemberRoles.forEach((role) => {
    //only keep role and get rid of id in [id, role]
    memberRoles.push(role[1]);
  });

  let addRoles = newRoles.filter(x => !memberRoles.includes(x)); // in newRoles but not in memberRoles

  let intersection = memberRoles.filter(x => allRoles.includes(x)); // in memberRoles & in allRoles
  let removeRoles = intersection.filter(x => !newRoles.includes(x)); // in memberRoles & in allRoles but not in newRoles

  // remove all roles that need to be removed
  let promiseRemove = [];
  removeRoles.forEach((role) => {
    promiseRemove.push(member.roles.remove(role));
  });
  await Promise.all(promiseRemove);
  console.log(`finished removing Roles for ${player.membershipId}`);

  // add all roles that need to be added
  let promiseAdd = [];
  addRoles.forEach((role) => {
    promiseAdd.push(member.roles.add(role));
  });
  await Promise.all(promiseAdd);
  console.log(`finished adding Roles for ${player.membershipId}`);

  await sendDM(member, addRoles, removeRoles);
};

clearRoles = async function clearRoles(member, player, guild) {
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

class MonthlyRoles {
  mentorId;
  fastIds;

  constructor(mentorId, fastIds) {
    this.mentorId = mentorId;
    this.fastIds = fastIds;
  }
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
  eow;
  scourge;
  cos;

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
    this.levi = new Raid();
    this.scourge = new Raid();
    this.cos = new Raid();

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
            //no role for solo taniks >:)
            if (lowman.playerCount !== 1) {
              this.dsc.normCount = lowman.playerCount;
            }
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
          if (lowman.playerCount === 1 || lowman.playerCount === 2) {
            if (lowman.playerCount < this.eow.normCount || this.eow.normCount === undefined) {
              this.eow.normCount = lowman.playerCount;
            }
          }
        }

          //levi
          // 0-5 = norm, rest = prestige
        // 7072393624 dk about this one (it's not in the manifest, but I remember some1 having an instance with this hash)
        else if (
          lowman.raid === 7072393624
          || lowman.raid === 2693136600 || lowman.raid === 2693136601 || lowman.raid === 2693136602 || lowman.raid === 2693136603 || lowman.raid === 2693136604 || lowman.raid === 2693136605
          || lowman.raid === 1800508819 || lowman.raid === 2449714930 || lowman.raid === 771164842 || lowman.raid === 3446541099 || lowman.raid === 508802457 || lowman.raid === 417231112
          || lowman.raid === 4206123728 || lowman.raid === 1685065161 || lowman.raid === 3912437239 || lowman.raid === 757116822 || lowman.raid === 3857338478 || lowman.raid === 3879860661
        ) {
          if (lowman.playerCount === 2) {
            this.levi.normCount = lowman.playerCount;
          }
        }

        //scourge
        else if (lowman.raid === 548750096) {
          if (this.scourge.normCount > lowman.playerCount || this.scourge.normCount === undefined) {
            this.scourge.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.scourge.flawCount > lowman.playerCount || this.scourge.flawCount === undefined) {
              this.scourge.flawCount = lowman.playerCount;
            }
          }
        }

        //cos
        else if (lowman.raid === 3333172150) {
          if (this.cos.normCount > lowman.playerCount || this.cos.normCount === undefined) {
            this.cos.normCount = lowman.playerCount;
          }
          if (lowman.flawless === true) {
            if (this.cos.flawCount > lowman.playerCount || this.cos.flawCount === undefined) {
              this.cos.flawCount = lowman.playerCount;
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
  eowDuo;
  leviDuo;
  scourgeDuo;
  scourgeTrioF;
  cosDuoF;
  cosTrioF;


  constructor(legendF, masterF, kfTrio, kfTrioF, kfDuo, kfTrioMF, vowTrio, vowTrioF, vowTrioMF, vogTrio, vogTrioF, vogDuo, vogDuoF, vogTrioMF, vogDuoMF, vogSolo, dscTrio, dscTrioF, dscDuo, dscDuoF, gosTrio, gosTrioF, gosDuo, lwTrio, lwTrioF, lwDuo, lwSolo, eowSolo, eowDuo, leviDuo, scourgeDuo, scourgeTrioF, cosDuoF, cosTrioF) {
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
    this.eowDuo = eowDuo;
    this.leviDuo = leviDuo;
    this.scourgeDuo = scourgeDuo;
    this.scourgeTrioF = scourgeTrioF;
    this.cosDuoF = cosDuoF;
    this.cosTrioF = cosTrioF;
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
      await guild.roles.fetch(eowSolo_id),
      await guild.roles.fetch(eowDuo_id),
      await guild.roles.fetch(leviDuo_id),
      await guild.roles.fetch(scourgeDuo_id),
      await guild.roles.fetch(scourgeTrioF_id),
      await guild.roles.fetch(crownDuoF_id),
      await guild.roles.fetch(crownTrioF_id)
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
      this.eowSolo,
      this.eowDuo,
      this.leviDuo,
      this.scourgeDuo,
      this.scourgeTrioF,
      this.cosDuoF,
      this.cosTrioF
    ];
  }
}