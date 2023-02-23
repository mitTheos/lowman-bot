const axios = require("axios");

module.exports = { search, raidStats };

async function search(username) {
  const encodedURL = encodeURI(encodeURI(`https://api.raidreport.dev/search/${username}`)).toLowerCase().replace("#", "%2523");
  const config = {
    method: "get",
    url: encodedURL,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 OPR/93.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9'
    }
  };
  let data = null;
  try {
    await axios(config)
        .then(function(response) {
          data = response.data;
        });
  } catch (err) {
    console.error(err);
  }
  return data;
}

async function raidStats(membershipId) {
  const config = {
    method: "get",
    url: `https://api.raidreport.dev/raid/player/${membershipId}`,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 OPR/93.0.0.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9'
    }
  };

  let data = null;
  try {
    await axios(config)
        .then(function(response) {
          data = response.data;
        });
  } catch (err) {
    console.error("!!== Axios request error on raid/player ==!!")
    console.error(err.response.statusCode + " " +  err.response.statusMessage);
    console.error(err.response.url);
  }
  return data;
}