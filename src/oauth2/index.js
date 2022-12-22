const { request } = require("undici");
const express = require("express");
const User = require("../schemas/user");
require("dotenv").config();
const { DATABASE_TOKEN } = process.env;
const { discordClientId, discordClientSecret, bungieClientId, bungieClientSecret, port, apiKey } = require("./config.json");
const fs = require("fs");
const https = require("https");
const chalk = require('chalk')
const mongoose = require("mongoose");
const { connect } = require("mongoose");
const options = {
  key: fs.readFileSync("C:/ssl-certificate/cert.key"),
  cert: fs.readFileSync("C:/ssl-certificate/cert.crt")
};

const app = express();
const server = https.createServer(options, app);
connect(DATABASE_TOKEN).catch(console.error);
let discordId = null;
let d2MembershipId = null;

app.get("/", async ({ query }, response) => {
  return response.redirect('https://discord.com/api/oauth2/authorize?client_id=1038048624493469806&redirect_uri=https%3A%2F%2Flocalhost%3A53134%2Fdiscord&response_type=code&scope=identify%20email%20guilds%20role_connections.write');
});

app.get("/discord", async ({ query }, response) => {
  const { code } = query;
  if (code) {
    try {
      const tokenResponseData = await request("https://discord.com/api/oauth2/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `https://localhost:${port}/discord`,
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
      discordId = response["id"];
      console.log(`Discord id: ${discordId}`);
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }

  return response.redirect('https://www.bungie.net/en/oauth/authorize?client_id=41964&response_type=code');
});

app.get("/bungie/", async ({ query }, response) => {
  const { code } = query;

  if (code) {
    try {
      const tokenResponseData = await request("https://www.bungie.net/platform/app/oauth/token/", {
        method: "POST",
        body: new URLSearchParams({
          client_id: bungieClientId,
          client_secret: bungieClientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `https://localhost:${port}/bungie`
        }).toString(),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const oauthData = await tokenResponseData.body.json();
      const userResult = await request("https://www.bungie.net/Platform/User/GetCurrentBungieAccount/", {
        headers: {
          "X-API-Key": `${apiKey}`,
          Authorization: `${oauthData.token_type} ${oauthData.access_token}`
        }
      }).catch(console.error);
      const response = await userResult.body.json();
      d2MembershipId = Object.values(response["Response"]["membershipOverrides"])[0]["membershipIdOverriding"];
      console.log(`D2 membership id: ${d2MembershipId}`)


      if(discordId!=null && d2MembershipId!= null) {
        let userProfile = await User.findOne({ discordId: discordId });
        if (!userProfile) userProfile = await new User({
          _id: mongoose.Types.ObjectId(),
          discordId: discordId,
          d2MembershipId: d2MembershipId
        });
        await userProfile.save().catch(console.error);
        console.log(chalk.green(`User created with {discordId: ${discordId}, d2MembershipId: ${d2MembershipId}}`));
      }

    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }
  return response.sendFile("src/oauth2/index.html", { root: "." });
});

server.listen(port, () => console.log(`Server started at https://localhost:${port}`));