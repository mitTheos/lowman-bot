const axios = require("axios");

module.exports = { getLowmans };

async function getLowmans(username) {
  let res = await axios.get(`https://lowman-verifier.herokuapp.com/lowmans/${username}`);
  let data = res.data;
  console.log(data);
  return data;
}
