var stripeProcessor = require('stripe');
var stripe = undefined;

exports.setApiKey = function (secretKey) {
    stripe = stripeProcessor(secretKey);
};

exports.charge = function (charge, callback) {
    if (!stripe) {
        callback(new Error("Stripe API key is not set."));
        return;
    }

    stripe.charges.create(charge, callback);
};

exports.canHaz = function () {
    if (stripe) {
        return true;
    }
    return false;
};