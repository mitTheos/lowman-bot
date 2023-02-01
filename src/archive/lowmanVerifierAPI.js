const axios = require("axios");

module.exports = { getLowmans };

async function getLowmans(username) {
  await axios.get(`https://lowman-verifier.herokuapp.com/lowmans/${username}`)
    .then(function(response) {
    return response.data;
  })
    .catch(function(error) {
      console.log(error);
    });
}
