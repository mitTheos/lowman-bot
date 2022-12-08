const {Schema, model} = require('mongoose')
const userSchema = new Schema({
  _id: Schema.Types.ObjectId,
  discordId: String,
  d2MembershipId: String
});
module.exports = model("User", userSchema);