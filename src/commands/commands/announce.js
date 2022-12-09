const { EmbedBuilder, SlashCommandBuilder } = require("discord.js");
const {GUILDID, CHANNELID} = process.env;
const mongoose = require('mongoose')
const User = require("../../schemas/user");
const { response } = require("express");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("announce")
    .setDescription("make an announcement"),
  async execute(interaction, client) {
    const guild = await client.guilds.fetch(GUILDID).catch(console.error);
    const channel = await guild.channels.fetch(CHANNELID).catch(console.error);

    const message = await interaction.deferReply({
      fetchReply: true
    });

    getData(async (callback) => {
        console.log(callback)

        const embed = new EmbedBuilder({
          title: "Registered Users",
        });
        callback.forEach((e) =>{
          embed.addFields({
            name: `discord id: ${e[`discordId`]}`,
            value: `d2 id: ${e[`d2MembershipId`]}`
          })
        })

        await channel.send({ embeds: [embed] }).catch(console.error);
        await interaction.editReply({
          content: `Announcement posted! \n <@${callback[0][`discordId`]}> is the first registered User! `
        });
      }
    );
  }
  }

  getData = (callback) => {
    User.find({}, function(err, result) {
      if (err) {
        console.error(err)
      } else {
        callback(result)
      }
    });
  }