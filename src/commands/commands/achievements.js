const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {
    kfDuo_id, kfTrio_id, kfTrioF_id, kfTrioMF_id, vowTrio_id, vowTrioF_id, vowTrioMF_id, vogTrio_id, vogTrioF_id, vogDuo_id, vogDuoF_id, vogTrioMF_id, vogDuoMF_id,
    vogSolo_id, dscTrio_id, dscTrioF_id, dscDuo_id, dscDuoF_id, gosTrio_id, gosTrioF_id, gosDuo_id, lwTrio_id, lwTrioF_id, lwDuo_id, lwSolo_id, eowSolo_id
} = require("../../config/roles");
const {GUILD_ID} = process.env;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("achievements")
        .setDescription("Display a full list of all of your accomplishments.")
        .setDMPermission(false),
    async execute(interaction, client) {

        // loading message
        console.log("===Achievements===");
        await interaction.deferReply({
            fetchReply: true
        });

        let soloArray = [];
        let duoArray = [];
        let trioArray = [];

        interaction.member.roles.cache.forEach((role) => {
            switch (role.id) {
                case kfTrio_id:
                    trioArray.push("✦ **Trio:** King's Fall")
                    break;
                case kfTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** King's Fall")
                    break;
                case kfDuo_id:
                    duoArray.push("✦ **Duo:** Oryx")
                    break;
                case kfTrioMF_id:
                    trioArray.push("✦ **Trio Flawless:** King's Fall (Master)")
                    break;
                case vowTrio_id:
                    trioArray.push("✦ **Trio:** Trio Vow of the Disciple")
                    break;
                case vowTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** Vow of the Disciple")
                    break;
                case vowTrioMF_id:
                    trioArray.push("✦ **Trio Flawless:** Vow of the Disciple (Master)")
                    break;
                case vogTrio_id:
                    trioArray.push("✦ **Trio:** Vault of Glass")
                    break;
                case vogTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** Vault of Glass")
                    break;
                case vogDuo_id :
                    duoArray.push("✦ **Duo:** Vault of Glass")
                    break;
                case vogDuoF_id:
                    duoArray.push("✦ **Duo Flawless:** Vault of Glass")
                    break;
                case vogTrioMF_id:
                    trioArray.push("✦ **Trio Flawless:** Vault of Glass (Master)")
                    break;
                case vogDuoMF_id:
                    duoArray.push("•✦ **Duo Flawless:** Vault of Glass (Master)")
                    break;
                case vogSolo_id:
                    soloArray.push("✦ **Solo:** Atheon")
                    break;
                case dscTrio_id:
                    trioArray.push("✦ **Trio:** Deep Stone Crypt")
                    break;
                case dscTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** Deep Stone Crypt")
                    break;
                case dscDuo_id:
                    duoArray.push("✦ **Duo:** Deep Stone Crypt")
                    break;
                case dscDuoF_id:
                    duoArray.push("✦ **Duo Flawless:** Deep Stone Crypt")
                    break;
                case gosTrio_id:
                    trioArray.push("✦ **Trio:** Garden of Salvation")
                    break;
                case gosTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** Garden of Salvation")
                    break;
                case gosDuo_id:
                    duoArray.push("✦ **Duo:** Sanctified Mind")
                    break;
                case lwTrio_id:
                    trioArray.push("✦ **Trio:** Last Wish")
                    break;
                case lwTrioF_id:
                    trioArray.push("✦ **Trio Flawless:** Last Wish")
                    break;
                case lwDuo_id:
                    duoArray.push("✦ **Duo:** Queenswalk")
                    break;
                case lwSolo_id:
                    soloArray.push("✦ **Solo:** Queenwalk")
                    break;
                case eowSolo_id:
                    soloArray.push("✦ **Solo:** Argos")
                    break;
            }
        })

        const embed = new EmbedBuilder()
            .setTitle(`${interaction.member.displayName}'s Achievements:`)
            .setColor(0xfa5c04)
            .addFields([
            {
                name: "**─ Solo ─**",
                value: returnString(soloArray)

            },
            {
                name: "**─ Duo ─**",
                value: returnString(duoArray)
            },
            {
                name: "**─ Trio ─**",
                value: returnString(trioArray)
            }
        ]);

        await interaction.editReply({
            embeds: [embed]
        }).then(() => console.log("Achievements Posted!"))
    }
};

function returnString(array){
    if(array.length >=1){
        return array.join("\n")
    }else{
        return "N/A"
    }
}
