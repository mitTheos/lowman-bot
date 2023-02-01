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
    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }).catch(function (error){
        if(error.response){
          console.error(`PGCR error: ${error.response.status}`)
        }
      }), 1000);
  return data;
}