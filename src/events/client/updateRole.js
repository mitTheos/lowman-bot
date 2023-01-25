const { guild_id, announce_channel_id, logs_channel_id } = require("../../config/guild");
const { dmArray } = require("../../functions/helpers/rolesHelper");
module.exports = {
  name: `guildMemberUpdate`,
  async execute(oldMember, newMember, client) {
    // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
      if(dmArray.some(e => e.member.user === newMember.user)){
        const e = dmArray.find(e => e.member.user === newMember.user);
       e.rolesRemoved = new Map([...e.rolesRemoved, ...removedRoles])
      } else{
        dmArray.push(new dm(newMember, [], removedRoles))
      }
    }

    // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
      if(dmArray.some(e => e.member.user === newMember.user)){
        const e = dmArray.find(e => e.member.user === newMember.user);
        e.rolesAdded = new Map([...e.rolesAdded, ...addedRoles])
      } else{
        dmArray.push(new dm(newMember,  addedRoles, []))
      }
    }
  }
};

class dm{
  member;
  rolesAdded;
  rolesRemoved;

  constructor(member, rolesAdded, rolesRemoved) {
    this.member = member;
    this.rolesAdded = rolesAdded;
    this.rolesRemoved = rolesRemoved;
  }
}