const axios = require("axios");

module.exports = { search, raidStats };

async function search(username) {
  const encodedURL = encodeURI(`https://api.raidreport.dev/search/${username}`)
  const config = {
    method: "get",
    url: encodedURL,
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
    url: `https://api.raidreport.dev/raid/player/${membershipId}`,
    headers: {}
  };

  let data = null;
  await axios(config)
    .then(function(response) {
      data = response.data;
    })
    .catch(function(error) {
      console.log(error);
    });
  return data;
}
