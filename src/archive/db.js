const { SlashCommandBuilder } = require("discord.js");
const User = require("../schemas/user");
const mongoose = require("mongoose");
module.exports = {
 data: new SlashCommandBuilder()
   .setName("db")
   .setDescription("test db"),
  async execute(interaction, client){
    let userProfile = await User.findOne({discordId: "777777"});
      if(!userProfile) userProfile =await new User({
      _id: mongoose.Types.ObjectId(),
      discordId: "77777777777",
      d2MembershipId: "999999999"
    });
    await userProfile.save().catch(console.error)
    await interaction.reply({
      content: `Discord id: ${userProfile.discordId}`
    })
  }
}