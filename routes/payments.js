var express = require('express');
var router = express.Router();

var superagent = require('superagent');

var db = require('./lib/data/payments');
var errors = require('./lib/errors');
var settings = require('./lib/settings');
var stripe = require('./lib/stripe');

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

var savePaypalPayment = function (paypal, callback) {
    // wknd2015: Weekend pass
    // wknd2015s: Weekend pass and shirt
    var weekendItemNumbers = ['wknd2015', 'wknd2015s'];
    var shirtItemNumbers = ['wknd2015s'];

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
        isShirt: isShirtOrder,
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


router.get('/paypal/return', function (req, res) {
    res.status(200).send("GET received");
});

router.post('/paypal/return', function (req, res) {
    res.status(200).send("POST received");
});


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

        // I can't get this to work. It would
        // be nice, but it's not required.
        // 
        // if (response !== "VERIFIED") {
        //     console.log("PAYPAL PAYMENT IGNORED.");
        //     console.log(response);
        //     return;
        // }

        // Save the payment to the database.
        savePaypalPayment(req.body, function (err) {
            if (err) {
                errors.log(err);
            }
            console.log("PAYPAL PAYMENT SAVED.");
        });
    });
});


// Ensure the latest Stripe key is set
router.use(function (req, res, next) {
    settings.getAll(function (err, settings) {
        if (err) {
            return next(err);
        }
        var keySetting = settings['stripe-secret-key'];
        if (keySetting) {
            stripe.setApiKey(keySetting.value);
        }
        next();
    });
});


router.post('/stripe', function (req, res) {
    console.log("STRIPE TOKEN:");
    console.log(req.body.token);

    var token = req.body.token;
    var rsvp = req.body.rsvp;

    // TODO: Configure
    var amount = 5000;
    var description = "Weekend pass";

    if (rsvp.shirt.isBuying) {
        amount = 6500;
        description = "Wknd + shirt";
    }

    var charge = {
        amount: amount,
        currency: "usd",
        card: token.id,
        description: description,
        statement_description: description
    };

    stripe.charge(charge, errors.guard(res, function (response) {
        var payment = {
            email: token.email,
            method: "stripe",
            isWeekendPass: true,
            isShirt: rsvp.shirt.isBuying || false,
            gross: response.amount,
            timestamp: Date.now(),
            meta: {
                created: response.created,
                transactionId: response.balance_transaction,
                currency: response.currency
            }
        };

        // If we get here and there's an error, that
        // is bad.
        db.add(payment, function (err) {
            if (err) {
                console.log("SUCCESSFUL PAYMENT NOT SAVED")
                console.log(err);
                console.log(payment);
                res.status(500).send();
            }
            res.status(200).send();
        });
    }));
});

module.exports = router;