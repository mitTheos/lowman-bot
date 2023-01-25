const { guild_id, announce_channel_id, logs_channel_id } = require("../../config/guild");
module.exports = {
  name: `guildMemberUpdate`,
  async execute(oldMember, newMember, client) {
    // If the role(s) are present on the old member object but no longer on the new one (i.e role(s) were removed)
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));
    if (removedRoles.size > 0) {
      newMember.send({ content: `> \`The role ${removedRoles.map(r => r.name)} was removed from you.\`` });
    }

    // If the role(s) are present on the new member object but are not on the old one (i.e role(s) were added)
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    if (addedRoles.size > 0) {
      newMember.send({ content: `> \`The role ${addedRoles.map(r => r.name)} was added to you.\`` });
    }
  }
};