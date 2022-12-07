const { request } = require('undici');
const express = require('express');
const { discordClientId, discordClientSecret,bungieClientId, bungieClientSecret, port } = require('./config.json');
const fs = require('fs');
const https = require("https");
const options = {
  key : fs.readFileSync("src/oauth2/config/cert.key"),
  cert : fs.readFileSync("src/oauth2/config/cert.crt")
}

const app = express();
const server = https.createServer(options,app)


app.use("/", express.static("public"));

app.get('/', async ({ query }, response) => {
  const { code } = query;

  if (code) {
    try {
      const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `https://localhost:${port}`,
          scope: 'identify',
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const oauthData = await tokenResponseData.body.json();
      console.log(oauthData);

      const userResult = await request('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      console.log(await userResult.body.json());
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }

  return response.sendFile('src/oauth2/index.html', { root: '.' });
});

app.get('/bungie/', async ({ query }, response) => {
  const { code } = query;

  if (code) {
    try {
      const tokenResponseData = await request('https://www.bungie.net/platform/app/oauth/token/', {
        method: 'POST',
        body: new URLSearchParams({
          client_id: bungieClientId,
          code,
          grant_type: 'authorization_code',
          redirect_uri: `https://localhost:${port}/bungie`,
        }).toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const oauthData = await tokenResponseData.body.json();
      console.log(oauthData);

      const userResult = await request('https://discord.com/api/users/@me', {
        headers: {
          authorization: `${oauthData.token_type} ${oauthData.access_token}`,
        },
      });

      console.log(await userResult.body.json());
    } catch (error) {
      // NOTE: An unauthorized token will not throw an error
      // tokenResponseData.statusCode will be 401
      console.error(error);
    }
  }

  return response.sendFile('src/oauth2/index.html', { root: '.' });
});
server.listen(port, () => console.log(`Server started at https://localhost:${port}`));