const User = require("../../schemas/user");

// retrieve data from DB
exports.getData = (callback) => {
    User.find({}, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            callback(result);
        }
    });
};

exports.getDataWithId = (discordId, callback) => {
    User.findOne({discordId: discordId}, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            callback(result);
        }
    });
};

exports.deleteUser = (discordId, callback) => {
    User.findOneAndDelete({discordId: discordId}, function (err, result) {
        if (err) {
            console.error(err);
        } else {
            callback(result);
        }
    });
};