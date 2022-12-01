const axios = require("axios");

module.exports = { search, raidStats };

async function search(username) {
  const config = {
    method: "get",
    url: `https://api.raidreport.dev/search/${username}`,
    headers: {}
  };
  let data;
  await axios(config)
    .then(function(response) {
      data = response.data;
    })
    .catch(function(error) {
      console.log(error);
    });
  return data;
}

async function raidStats(membershipId) {
  const config = {
    method: "get",
    url: "https://api.raidreport.dev/raid/player/4611686018457582666",
    headers: {}
  };

  let data;
  await axios(config)
    .then(function(response) {
      data = response.data;
    })
    .catch(function(error) {
      console.log(error);
    });
  return data;
}
