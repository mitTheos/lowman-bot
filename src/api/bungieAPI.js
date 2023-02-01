const axios = require("axios");

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
    setTimeout(
    await axios(config)
      .then(function(response) {
        data = response.data;
      }), 1000);
  } catch (err) {
  }
  return data;
}