const axios = require("axios");
const { response } = require("express");

module.exports = { search, raidStats };

async function search(username) {
  const encodedURL = encodeURI(encodeURI(`https://api.raidreport.dev/search/${username}`)).toLowerCase().replace("#", "%2523");
  const config = {
    method: "get",
    url: encodedURL,
    headers: {}
  };
  let data = null;

    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }).catch(function (error){
        console.error(`search error: ${error.response.status}`);
      }), 1000);
  return data;
}

async function raidStats(membershipId) {
  const config = {
    method: "get",
    url: `https://api.raidreport.dev/raid/player/${membershipId}`.replace("'", ""),
    headers: {}
  };

  let data = null;

    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }).catch(function (error){
        console.error(`RaidStats error: ${error.response.status}`);
      }), 1000);
  return data;
}
