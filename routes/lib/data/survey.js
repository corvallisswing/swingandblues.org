var couch = require('./couch');
var database = couch.db;

module.exports.add = function (survey, callback) {
    survey.type = "survey";
    database.insert(survey, callback);
};

module.exports.get = function (id, callback) {
    couch.docs.get(id, callback);
};

module.exports.update = function (survey, callback) {
    var err;
    if (!survey || !survey._id) {
        err = new Error("No survey specified");
        return callback(err);
    }

    couch.docs.get(survey._id, function (err, previousSurvey) {
        if (err) {
            return callback(err);
        }

        if (!previousSurvey || previousSurvey.type !== "survey") {
            err = new Error("survey not found: " + survey._id);
            return callback(err);
        }

        couch.docs.update(survey, callback);
    });
};

// module.exports.findByEmail = function (email, callback) {
//     couch.findOneByKey('rsvp/byEmail', email, callback);
// };

// module.exports.allByEmail = function (callback) {
//     couch.view('rsvp/byEmail', callback);
// };

module.exports.allByTime = function (callback) {
    couch.view('survey/byTime', callback);
};