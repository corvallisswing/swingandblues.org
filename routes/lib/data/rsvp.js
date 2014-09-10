var couch = require('./couch');
var database = couch.db;

module.exports.add = function (rsvp, callback) {
    rsvp.type = "rsvp";
    database.insert(rsvp, callback);
};

module.exports.update = function (rsvp, callback) {
    var err;
    if (!rsvp || !rsvp._id) {
        err = new Error("No rsvp specified");
        return callback(err);
    }

    couch.docs.get(rsvp._id, function (err, previousRsvp) {
        if (err) {
            return callback(err);
        }

        if (!previousRsvp || previousRsvp.type !== "rsvp") {
            err = new Error("rsvp not found: " + rsvp._id);
            return callback(err);
        }

        couch.docs.update(rsvp, callback);
    });
};

module.exports.findByEmail = function (email, callback) {
    couch.findOneByKey('rsvp/byEmail', email, callback);
};

module.exports.allByEmail = function (callback) {
    couch.view('rsvp/byEmail', callback);
};

module.exports.allByName = function (callback) {
    couch.view('rsvp/byName', callback);
};