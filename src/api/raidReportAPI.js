const axios = require("axios");

module.exports = { search, raidStats };

async function search(username) {
  const encodedURL = encodeURI(encodeURI(`https://api.raidreport.dev/search/${username}`)).toLowerCase().replace("#", "%2523");
  const config = {
    method: "get",
    url: encodedURL,
    headers: {}
  };
  let data = null;
  try {
    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }), 1000);
  } catch (err) {
    console.error(err);
  }
  return data;
}

async function raidStats(membershipId) {
  const config = {
    method: "get",
    url: `https://api.raidreport.dev/raid/player/${membershipId}`.replace("'", ""),
    headers: {}
  };

  let data = null;

  try {
    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }), 1000);
  } catch (err) {
  }
  return data;
}
