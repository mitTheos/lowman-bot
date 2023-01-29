const axios = require("axios");

module.exports = { search, raidStats };

async function search(username) {
  const encodedURL = encodeURI(encodeURI(`https://api.raidreport.dev/search/${username}`)).toLowerCase().replace('#', '%2523')
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
  if(membershipId !==4611686018507522477) {
    const config = {
      method: "get",
      url: `https://api.raidreport.dev/raid/player/${membershipId}`,
      headers: {}
    };

    let data = null;
    await axios(config)
        .then(function (response) {
            console.log(response)
          data = response.data;
        })
        .catch(function (error) {
          console.log(error);
        });
    return data;
  }
}
