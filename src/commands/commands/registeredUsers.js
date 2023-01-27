const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registered-users")
    .setDescription("Display the amount of registered users with Lowman Bot.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .setDMPermission(false),
  async execute(interaction) {
    console.log("===Registered Users===");

    //loading message
    await interaction.deferReply({
      fetchReply: true
    });

    console.log("getting data...");
    getData(async (users) => {
      console.log("db data received, outputting message...");
      const embed = new EmbedBuilder()
        .setTitle(`Registered Users: ${users.length}`)
          .setColor(0xfa5c04);

      await interaction.editReply({
        embeds: [embed]
      }).then(()=>console.log("Registered users posted!"));
    });
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
