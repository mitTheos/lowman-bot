const axios = require("axios");
const { response } = require("express");

module.exports = { getPGCR };

async function getPGCR(activityID) {
  const config = {
    method: "get",
    url: `https://stats.bungie.net/Platform/Destiny2/Stats/PostGameCarnageReport/${activityID}/`,
    headers: {
      "X-API-Key": "fa0dd5570093453ebb6bbbd3c8e087a2"
    }
  };
  let data = null;
  try {
    setTimeout(async function() {
      await axios(config)
        .then(function(response) {
          data = response.data;
          console.log(`status code for pgcr(${activityID}.`);
        });
    }, 1000);
  } catch (err) {

  }
  return data;
}