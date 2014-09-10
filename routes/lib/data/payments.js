var couch = require('./couch');
var database = couch.db;

module.exports.add = function (payment, callback) {
    payment.type = "payment";
    database.insert(payment, callback);
};