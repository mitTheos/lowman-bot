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
          console.log(`status code for search(${username}): ${response.status}.`);
        });
    }, 1000);
  } catch (err) {}
  return data;
}

async function raidStats(membershipId) {
  const config = {
    method: "get",
    url: `https://api.raidreport.dev/raid/player/${membershipId}`.replace("'", ""),
    headers: {}
  };

  let data = null;
setTimeout(async function () {
  await axios.get(`https://api.raidreport.dev/raid/player/${membershipId}`).catch(function(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    console.log(error.config);
  })
}, 2000);
  return data;
}
