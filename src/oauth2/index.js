require("dotenv").config();
const { request } = require("undici");
const express = require("express");
const User = require("../schemas/user");
const { DATABASE_TOKEN, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, BUNGIE_CLIENT_ID, BUNGIE_CLIENT_SECRET, PORT, API_KEY } = process.env;
const chalk = require("chalk");
const mongoose = require("mongoose");
const { connect } = require("mongoose");
const { getPlayer, addRoles } = require("../functions/helpers/rolesHelper");
const { client } = require("../bot");
const { guild_id } = require("../config/guild");
const cookieParser = require("cookie-parser");

const app = express();
// use cookies for app
app.use(cookieParser());

connect(DATABASE_TOKEN).catch(console.error);

app.get("/", async ({ query }, response) => {
  console.log("Redirecting");
  return response.redirect("https://discord.com/api/oauth2/authorize?client_id=1038048624493469806&redirect_uri=https%3A%2F%2Flowman.app%2Fdiscord&response_type=code&scope=identify%20guilds%20role_connections.write");
});

app.get("/invite", async ({ query }, response) => {
  return response.redirect("https://discord.com/api/oauth2/authorize?client_id=1038048624493469806&scope=applications.commands");
});

app.get("/discord", async (req, response) => {
  const query = req.query;
  const { code } = query;
  const res = response;
  if (code) {
    try {
      const tokenResponseData = await request("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: DISCORD_CLIENT_ID,
          client_secret: DISCORD_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: `https://lowman.app/discord`,
          scope: "identify"
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const oauthData = await tokenResponseData.body.json();
      const userResult = await request("https://discord.com/api/users/@me", {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`
        }
      }).catch(console.error);

      const response = await userResult.body.json();
      const discordId = response["id"];
      res.cookie("discordId", response["id"], { maxAge: 900000, httpOnly: false });
      console.log(`User ${discordId} Authenticated Discord`);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }

  return response.redirect("https://www.bungie.net/en/oauth/authorize?client_id=41964&response_type=code");
});

app.get("/bungie/", async (req, response) => {
  try {
    const query = req.query;
    const { code } = query;
    const res = response;
    if (code) {
      try {
        const tokenResponseData = await request("https://www.bungie.net/platform/app/oauth/token/", {
          method: "POST",
          body: new URLSearchParams({
            client_id: BUNGIE_CLIENT_ID,
            client_secret: BUNGIE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: `https://lowman.app/bungie`
          }).toString(),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

        const oauthData = await tokenResponseData.body.json();
        const bungieMembershipId = oauthData["membership_id"];
        const userResult = await request(`https://www.bungie.net/Platform/Destiny2/254/Profile/${bungieMembershipId}/LinkedProfiles/`, {
          headers: {
            "X-API-Key": `${API_KEY}`,
            Authorization: `${oauthData.token_type} ${oauthData.access_token}`
          }
        }).catch(console.error);

        const response = await userResult.body.json();

        const profiles = Object.values(response["Response"]["profiles"]);
        console.log(profiles);
        let id = 0;
        // if (profile[id]["isCrossSavePrimary"] === true){
        //   d2MembershipId = profile[id]["membershipId"]
        // }else {
        //   while (profile[id]["isCrossSavePrimary"] !== true){
        //     id++;
        //   }
        res.cookie("d2MembershipId", profiles[0]["membershipId"], { maxAge: 900000, httpOnly: false });
        const d2MembershipId = profiles[0]["membershipId"];
        const discordId = req.cookies["discordId"];
        console.log(req.cookies);
        console.log(req.signedCookies);
        console.log(req.cookies["d2MembershipId"]);
        console.log(req.cookies["discordId"]);
        // console.error("==============Was not the PrimaryCrossSave Profile!")
        // }
        console.log(`User ${d2MembershipId} Authenticated Discord`);

        if (discordId != null && d2MembershipId != null) {
          let userProfile = await User.findOne({ discordId: discordId });
          if (!userProfile) userProfile = await new User({
            _id: mongoose.Types.ObjectId(),
            discordId: req.cookies["discordId"],
            d2MembershipId: d2MembershipId
          });
          await userProfile.save().catch(console.error);
          console.log(chalk.green(`User created with {discordId: ${discordId}, d2MembershipId: ${d2MembershipId}}`));

          //add Roles
          client.guilds.fetch(guild_id).catch(console.error).then(async (guild) => {
            const member = await guild.members.fetch(discordId);
            getPlayer(d2MembershipId, async (player) => {
              await addRoles(member, player, guild);
              await member.send("You've registered with the bot successfully!").catch(console.error);
              console.log(`Finished Registration for User{discordId: ${discordId}, d2MembershipId: ${d2MembershipId}}`);
            });
          });
        }
      } catch (error) {
        // NOTE: An unauthorized token will not throw an error
        // tokenResponseData.statusCode will be 401
        console.error(error);
      }
    }
    return response.sendFile("src/oauth2/success.html", { root: "." });
  } catch (ex) {
    console.error(ex);
    return response.sendFile("src/oauth2/failure.html", { root: "." });
  }
});

app.listen(PORT, () => console.log(`Server started at https://lowman.app/`));
