var couch = require('./couch');
var database = couch.db;

module.exports.add = function (rsvp, callback) {
    rsvp.type = "rsvp";
    database.insert(rsvp, callback);
};

module.exports.update = function (rsvp, callback) {
    // TODO: Things!
    callback();
};