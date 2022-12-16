const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const bungieAPI = require("../../api/bungieAPI");
const raidReportAPI = require("../../api/raidReportAPI");
const User = require("../../schemas/user");
const {GUILDID, CHANNELID} = process.env;

module.exports = {
    data: new SlashCommandBuilder().setName("pb").setDescription("Return my pb"), async execute(interaction, client) {
        const guild = await client.guilds.fetch(GUILDID).catch(console.error);
        const channel = await guild.channels.fetch(CHANNELID).catch(console.error);
        const message = await interaction.deferReply({
            fetchReply: true
        });
        getData(async (users) => {
            console.log(users)
            getBest(users, async (best) => {
                console.log(best)
                const embed = new EmbedBuilder({
                    "type": "rich", "title": `Fastest Last Wish`, "description": `Fastest lowman LW last month`, "color": 0x00FFFF, "fields": [{
                        "name": convertTime(best.lw), "value": "\u200B"
                    }], "image": {
                        "url": `https://imgur.com/Vs3CemK.png`, "height": 0, "width": 0
                    }
                });

                await channel.send({"content": "<@244162314532683788> best goat", embeds: [embed]}).catch(console.error);

                await interaction.editReply({
                    content: `Announcement posted!`
                });
            });
        });
    }
};

function convertTime(time) {
    if (time == null) {
        return "x";
    } else if (time / 3600 >= 1) {
        const hours = Math.floor(time / 3600);
        time = time - hours;
        const minutes = Math.floor((time - hours * 3600) / 60);
        const seconds = time - minutes * 60 - hours * 3600;
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        const minutes = Math.floor((time) / 60);
        const seconds = time - minutes * 60;
        return `${minutes}m ${seconds}s`;
    }
}

const getBest = (data, callback) => {
    let best = new Pb();
    let counter = 0;
    for (const e of data) {
        getPb(e["d2MembershipId"], (pb) => {
            if (pb.playedUsersCountMonthly > best.playedUsersCountMonthly[0]) {
                best.playedUsersCountMonthly[0] = [pb.playedUsersCountMonthly, pb.membershipId];
                best.playedUsersMonthly[0] = [pb.playedUsersMonthly, pb.membershipId];
            }
            if (pb.kf < best.kf || best.kf === null) {
                best.kf = pb.kf;
            }
            if (pb.vow < best.vow || best.vow === null) {
                best.vow = pb.vow;
            }
            if (pb.vog < best.vog || best.vog === null) {
                best.vog = pb.vog;
            }
            if (pb.dsc < best.dsc || best.dsc === null) {
                best.dsc = pb.dsc;
            }
            if (pb.gos < best.gos || best.gos === null) {
                best.gos = pb.gos;
            }
            if (pb.lw < best.lw || best.lw === null) {
                best.lw = pb.lw;
            }
            if (counter === data.length - 1) {
                callback(best);
            } else {
                counter++;
            }
        });
    }
}

getData = (callback) => {
    User.find({}, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            callback(result);
        }
    });
};

const getPb = (membershipId, callback) => {
    getInstances(membershipId, (hashcodeMap) => {
        addPlayers(hashcodeMap, (list) => {
            const pb = new Pb(membershipId, list[0], list[1]);
            callback(pb)
        });
    });
};

const getInstances = (membershipId, callback) => {
    let instanceHashcodeMap = new Map();
    raidReportAPI.raidStats(membershipId).then((data) => {
        const activities = data.response["activities"];

        if (activities != null) {
            for (const activity of activities) {
                const lowmans = activity["values"]["lowAccountCountActivities"];

                if (lowmans != null) {
                    for (const lowman of lowmans) {
                        if (lowman["fresh"] === true) {
                            const instanceId = lowman["instanceId"];
                            instanceHashcodeMap.set(instanceId, activity["activityHash"]);
                        }
                    }
                }
            }
        }
        callback(instanceHashcodeMap);
    });
};

const addPlayers = async (hashcodeMap, callback) => {
    let uniquePlayerList = [];
    let lowmanList = [];
    for (const instance of Array.from(hashcodeMap.keys())) {
        const lowmanListPromise = await getInstanceInfo(instance, hashcodeMap);
        lowmanListPromise[0].forEach((e) => lowmanList.push(e));
        let playerList = [];
        lowmanListPromise[0].forEach((e) => e.players.forEach((f) => playerList.push(f)));
        // const playerList = lowmanList.players;
        for (const player of playerList) {
            //check if player is unique
            // the player themselves are still added!!
            if (!uniquePlayerList.includes(player)) {
                uniquePlayerList.push(player);
            }
        }
    }
    const returnList = [uniquePlayerList, lowmanList];
    callback(returnList);
};

async function getInstanceInfo(instance, hashcodeMap) {
    let playersListMonthly = [];
    let lowmanListMonthly = [];
    await bungieAPI.getPGCR(instance).then((data) => {
        const response = data.Response;
        //ISO dates
        const dateNow = new Date();
        dateNow.setMonth(dateNow.getMonth() - 1);
        const dateOneMonthAgo = dateNow.toISOString();
        const instanceDate = response["period"];

        //only get data from instances that are a Month or less old
        if (dateOneMonthAgo <= instanceDate) {


            //players
            for (const entry of response.entries) {
                const name = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayName"];
                const tag = entry["player"]["destinyUserInfo"]["bungieGlobalDisplayNameCode"];
                playersListMonthly.push(`${name}#${tag}`);
            }
            //speed times
            lowmanListMonthly.push(new Lowman(instance, response.entries["0"]["values"]["activityDurationSeconds"]["basic"]["value"], playersListMonthly, hashcodeMap.get(instance)));
        }
    });
    return [lowmanListMonthly];
}


class Lowman {
    instance;
    activityTime;
    players;
    raid;


    constructor(instance, activityTime, players, raid) {
        this.instance = instance;
        this.activityTime = activityTime;
        this.players = players;
        this.raid = raid;
    }
}

class Pb {
    membershipId;
    playedUsersMonthly;
    playedUsersCountMonthly;
    kf;
    vow;
    vog;
    dsc;
    gos;
    lw;

    constructor(membershipId, playedUsersMonthly, lowmanList) {
        this.membershipId = membershipId;
        this.playedUsersMonthly = playedUsersMonthly;
        if (playedUsersMonthly != null) {
            if (playedUsersMonthly.length > 1) {
                this.playedUsersCountMonthly = playedUsersMonthly.length - 1;
            }
        } else {
            this.playedUsersCountMonthly = null;
        }
        this.kf = null;
        this.vow = null;
        this.vog = null;
        this.dsc = null;
        this.gos = null;
        this.lw = null;

        if (lowmanList != null) {
            lowmanList.forEach(lowman => {
                // kf
                if (lowman.raid === 1374392663) {
                    if (this.kf > lowman.activityTime || this.kf == null) {
                        this.kf = lowman.activityTime;
                    }
                }
                // vow
                else if (lowman.raid === 1441982566) {
                    if (this.vow > lowman.activityTime || this.vow == null) {
                        this.vow = lowman.activityTime;
                    }
                }
                // vog
                else if (lowman.raid === 3881495763) {
                    if (this.vog > lowman.activityTime || this.vog == null) {
                        this.vog = lowman.activityTime;
                    }
                }
                // dsc
                else if (lowman.raid === 910380154) {
                    if (this.dsc > lowman.activityTime || this.dsc == null) {
                        this.dsc = lowman.activityTime;
                    }
                }
                // gos1
                else if (lowman.raid === 3458480158) {
                    if (this.gos > lowman.activityTime || this.gos == null) {
                        this.gos = lowman.activityTime;
                    }
                }
                // gos2
                else if (lowman.raid === 2659723068) {
                    if (this.gos > lowman.activityTime || this.gos == null) {
                        this.gos = lowman.activityTime;
                    }
                }
                // lw
                else if (lowman.raid === 2122313384) {
                    if (this.lw > lowman.activityTime || this.lw == null) {
                        this.lw = lowman.activityTime;
                    }
                }
            });
        }
    }
}