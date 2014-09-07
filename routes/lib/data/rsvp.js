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

module.exports.allByEmail = function (callback) {
    couch.view('rsvp/byEmail', callback);
};

module.exports.allByName = function (callback) {
    couch.view('rsvp/byName', callback);
};