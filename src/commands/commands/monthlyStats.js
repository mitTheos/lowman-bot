const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {PermissionFlagsBits} = require("discord-api-types/v10");
const {convertTime} = require("../../functions/helpers/convertTime");
const {getPlayedWith} = require("../../functions/helpers/monthlyStatsHelper");
const {
    vowEmoji_id, vowEmoji_name, kfEmoji_name, kfEmoji_id, vogEmoji_name, vogEmoji_id, dscEmoji_id, dscEmoji_name, gosEmoji_name, gosEmoji_id, wishEmoji_id,
    wishEmoji_name
} = require("../../config/emojis");
const {getMessageDate} = require("../../functions/helpers/announceHelper");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("monthly-stats")
        .setDescription("Return stats on the past month")
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("Bungie username")
                .setRequired(true)
        )
        .setDMPermission(false)
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction, client) {

        // loading message
        console.log("===MonthlyStats===");
        const message = await interaction.deferReply({
            fetchReply: true,
        });

        const username = interaction.options.get("username").value;
        getPlayedWith(username, async (callback) => {
            if (callback !== null) {
                const mentorEmbed = new EmbedBuilder()
                    .setTitle(`Mentor stats (${getMessageDate(0)})`)
                    .setColor(0xfa5c04)
                    .addFields([
                        {
                            name: "Players you've played with",
                            value: callback.playerCount.toString()
                        }
                    ]);
                const raidEmbed = new EmbedBuilder()
                    .setTitle(`Fastest lowmans (${getMessageDate(0)})`)
                    .setColor(0xfa5c04)
                    .addFields([
                        {
                            name: `<:${kfEmoji_name}:${kfEmoji_id}> KF`,
                            value: convertTime(callback.pb.kf),
                            inline: true
                        },
                        {
                            name: `<:${vowEmoji_name}:${vowEmoji_id}>VOW`,
                            value: convertTime(callback.pb.vow),
                            inline: true
                        },
                        {
                            name: `<:${vogEmoji_name}:${vogEmoji_id}> VOG`,
                            value: convertTime(callback.pb.vog),
                            inline: true
                        },
                        {
                            name: `<:${dscEmoji_name}:${dscEmoji_id}> DSC`,
                            value: convertTime(callback.pb.dsc),
                            inline: true
                        },
                        {
                            name: `<:${gosEmoji_name}:${gosEmoji_id}> GOS`,
                            value: convertTime(callback.pb.gos),
                            inline: true
                        },
                        {
                            name: `<:${wishEmoji_name}:${wishEmoji_id}> LW`,
                            value: convertTime(callback.pb.lw),
                            inline: true
                        }
                    ]);

                await interaction.editReply({
                    embeds: [mentorEmbed, raidEmbed]
                }).then(() => console.log("Monthly Stats posted!"));
            } else {
                await interaction.editReply({
                    content: "No user was found with that username! Please try again"
                }).then(() => console.log("Error, no user was found"));
            }
        });
    }
};