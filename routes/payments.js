var express = require('express');
var router = express.Router();

var superagent = require('superagent');

var db = require('./lib/data/payments');
var errors = require('./lib/errors');

var verifyIpn = function (ipn, callback) {
    if (!ipn) {
        return callback();
    }

    var req = superagent.post('https://www.paypal.com/cgi-bin/webscr');
    // Reference: 
    // https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/#id08CKFJ00JYK
    req.send('cmd=_notify-validate');

    for (var propName in ipn) {
        req.send(propName + '=' + ipn[propName]);
    }

    req.end(function (res) {
        callback(null, res.text);
    });
};

var savePayment = function (paypal, callback) {
    // AQUACQJZJ5CDQ: Weekend pass
    // G8GANEEDRWNUY: Weekend pass and shirt
    var weekendItemNumbers = ['AQUACQJZJ5CDQ', 'G8GANEEDRWNUY'];
    var shirtItemNumbers = ['G8GANEEDRWNUY'];

    var isWeekendItemNumber = function (itemNumber) {
        return (weekendItemNumbers.indexOf(itemNumber) >= 0);
    };

    var isShirtItemNumber = function (itemNumber) {
        return (shirtItemNumbers.indexOf(itemNumber) >= 0);
    };

    var isValidItemNumber = function (itemNumber) {
        return isWeekendItemNumber(itemNumber) || isShirtItemNumber(itemNumber);
    };

    var shouldProcessNotification = 
        paypal.payment_status === 'Completed' &&
        paypal.item_number &&
        paypal.option_selection1 &&
        isValidItemNumber(paypal.item_number);

    if (!shouldProcessNotification) {
        return callback();
    }

    var email = paypal.option_selection1;
    var isShirtOrder = isShirtItemNumber(paypal.item_number);
    var isWeekendOrder = isWeekendItemNumber(paypal.item_number);

    var payment = {
        email: email,
        method: "paypal",
        isWeekendPass: isWeekendOrder,
        isShirt: isShirt,
        gross: paypal.mc_gross,
        fee: paypal.mc_fee,
        timestamp: Date.now(),
        meta: {
            date: paypal.payment_date,
            firstName: paypal.first_name,
            lastName: paypal.last_name,
            transactionId: paypal.txn_id,
            receiverEmail: paypal.receiver_email,
            currency: paypal.mc_currency    
        }
    };

    // TODO: If we're concerned about fraud, we'll want to 
    // double-check the mc_gross and the receiver_email
    // is ours (otherwise someone could POST us a payment to
    // another paypal account).
    db.add(payment, callback);
};

// This URL is specified in our Paypal account. It receives
// a JSON object for every payment to our account, not just
// weekend payments.
router.post('/paypal/', function (req, res) {
    console.log("PAYPAL NOTIFICATION:");
    console.log(req.body);

    // As per the Paypal spec, respond with OK right away.
    res.status(200).send();

    // Then send a POST, containing the request.
    verifyIpn(req.body, function (err, response) {
        if (err) {
            errors.log(err);
            return;
        }

        if (response !== "VERIFIED") {
            console.log("PAYPAL PAYMENT IGNORED.");
            return;
        }

        // Save the payment to the database.
        savePayment(req.body, function (err) {
            if (err) {
                errors.log(err);
            }
            console.log("PAYPAL PAYMENT SAVED.");
        });
    });
});

module.exports = router;