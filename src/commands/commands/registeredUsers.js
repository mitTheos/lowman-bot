const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../schemas/user");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("registered-users")
    .setDescription("Show the number of registered users")
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
        .setTitle(`Current Amount of registered Users: ${users.length}`);

      await interaction.editReply({
        embeds: [embed]
      }).then(console.log("Registered users posted!"));
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