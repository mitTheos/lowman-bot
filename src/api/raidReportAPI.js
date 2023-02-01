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
  try {
    setTimeout(async function() {
      await axios(config)
        .then(function(response) {
          data = response.data;
          console.log(`status code for search(${username}.`);
        });
    }, 1000);
  } catch (err) {

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
    setTimeout(async function() {
      await axios(config)
        .then(function(response) {
          data = response.data;
          console.log(`status code for raidStats(${membershipId}.`);
        });
    }, 1000);
  } catch (err) {

  }
  return data;
}
