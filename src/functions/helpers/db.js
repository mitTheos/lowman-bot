const User = require("../../schemas/user");

// retrieve data from DB
exports.getData = (callback) => {
  User.find({}, function(err, result) {
    if (err) {
      console.error(err);
    } else {
      callback(result);
    }
  });
};