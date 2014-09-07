var db = require('./lib/data/rsvp');
var errors = require('./lib/errors');
var emailer = require('./lib/email/rsvpEmailer');

var express = require('express');
var router = express.Router();

// Init session rsvp 
router.use(function (req, res, next) {
    var defaultRsvp = {
        person: {},
        travel: {},
        hosting: {},
        housing: {},
        shirt: {},
        food: {
            diet: {},
            allergies: {}
        },
        meta: {},
        payment: {}
    };

    if (!req.session.rsvp) {
        req.session.rsvp = defaultRsvp;
    }

    // ensure one level of default properties
    for (var prop in defaultRsvp) {
        if (!req.session.rsvp[prop]) {
            req.session.rsvp[prop] = defaultRsvp[prop];
        }
    }

    // Make this available to all rsvp templates
    res.locals.rsvp = req.session.rsvp;
    next();
});

router.get('/', function (req, res) {
    res.render('rsvp-start', { 
        title: 'Swing and Blues Weekend',
        person: req.session.rsvp.person
    });
});

router.get('/choose-your-adventure', function (req, res) {
    res.render('choose-adventure');
});

router.get('/travel', function (req, res) {
    res.render('rsvp-travel');
});

router.get('/food', function (req, res) {
    res.render('rsvp-food', {
        diets: [
            {key: 'fun', name: "I like checking boxes"},
            {key: 'vegan', name: "Vegan"},
            {key: 'vegetarian', name: "Vegetarian"}
        ],
        allergies: [
        // These are the top 10 allergies 
        // in the United States
            {key: 'milk', name: 'Milk', },
            {key: 'eggs', name: 'Eggs'},
            {key: 'peanuts', name: 'Peanuts'},
            {key: 'cyanide', name: 'Cyanide'},
            {key: 'treeNuts', name: 'Tree nuts'},
            {key: 'fish', name: 'Fish'},
            {key: 'poison', name: 'Poison'},
            {key: 'shellfish', name: 'Shellfish'},
            {key: 'soy', name: 'Soy'},
            {key: 'wheat', name: 'Wheat'}
        ]
    });
});

router.get('/hosting', function (req, res) {
    res.render('rsvp-hosting');
});

router.get('/payment', function (req, res) {
    res.render('rsvp-payment');
});

router.get('/paid', function (req, res) {
    res.render('rsvp-paid');
});

router.get('/thanks', function (req, res) {
    res.render('rsvp-thanks');
});

router.get('/data', function (req, res) {
    res.status(200).send(req.session.rsvp);
});

router.get('/data/reset', function (req, res) {
    req.session.destroy(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/person', function (req, res) {
    var data = req.body;

    req.session.rsvp.person = data;
    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/adventure', function (req, res) {
    var data = req.body;

    req.session.rsvp.hosting = data.hosting;
    req.session.rsvp.housing = data.housing;
    req.session.rsvp.shirt = data.shirt;
    req.session.rsvp.volunteer = data.volunteer;

    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/travel', function (req, res) {
    var data = req.body;

    req.session.rsvp.travel = data.travel;
    req.session.rsvp.housing = data.housing;

    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/food', function (req, res) {
    var data = req.body;

    req.session.rsvp.food = data;

    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/hosting', function (req, res) {
    var data = req.body;

    req.session.rsvp.hosting = data;
    
    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/payment', function (req, res) {
    var data = req.body;
    req.session.rsvp.payment = {
        method: data.method
    };
    req.session.save(errors.guard(res, function() {
        res.status(200).send();
    }))
});

router.post('/data/submit', function (req, res) {
    
    req.session.rsvp.meta.submitted = true;
    req.session.rsvp.meta.timestamp = Date.now();
    req.session.rsvp.payment.amount = 50;
    
    var rsvp = req.session.rsvp;

    console.log("RSVP SUBMISSION:");
    console.log(JSON.stringify(rsvp));

    
    db.add(rsvp, errors.guard(res, function () {
    // TODO: Temporary disable emails ...
    //     emailer.sendEmail(rsvp, errors.guard(res, function () {
            req.session.save(errors.guard(res, function () {
                res.status(200).send();        
            }));
    //     }));
    }));
});

// This URL is specified in our Paypal account. It receives
// a JSON object for every payment to our account, not just
// weekend payments.
router.post('/submit/payment/paypal/', function (req, res) {
    
    console.log("PAYPAL NOTIFICATION:");
    console.log(req.body);
    res.status(200).send();
    return;

    // This is the code from 2014:
    //
    // var paypal = req.body;
    // var weekendItemNumbers = config.paypalWeekendItemNumbers();
    // var shirtItemNumbers = config.paypalShirtItemNumbers();

    // var isValidItemNumber = function (itemNumber) {
    //     return isWeekendItemNumber(itemNumber) || isShirtItemNumber(itemNumber);
    // };

    // var isWeekendItemNumber = function (itemNumber) {
    //     return (weekendItemNumbers.indexOf(itemNumber) >= 0);
    // };

    // var isShirtItemNumber = function (itemNumber) {
    //     return (shirtItemNumbers.indexOf(itemNumber) >= 0);
    // };

    // if (paypal.payment_status === 'Completed'
    //  && paypal.item_number
    //  && paypal.option_selection1
    //  && isValidItemNumber(paypal.item_number)) {

    //     var email = paypal.option_selection1;
    //     var isShirtOrder = isShirtItemNumber(paypal.item_number);
    //     var isWeekendOrder = isWeekendItemNumber(paypal.item_number);

    //     var success = function () {
    //         res.send(200);
    //     };
    //     var failure = function (err) {
    //         console.log(err);
    //         res.send(200);
    //     };

    //     var emailFound = function(docs) {
    //         if (docs.length && docs.length === 1) {
    //             var guestData = docs[0];

    //             var editedBy = "Automated System";
    //             var paymentStatus = "received";
    //             var guestId = guestData._id;

    //             // TODO: This is dumb, and should be refactored.
    //             if (isWeekendOrder && isShirtOrder) {
    //                 dataDb.setPaymentStatus(
    //                     paymentStatus, guestId, editedBy,
    //                     function (data) {
    //                         dataDb.setShirtStatus(
    //                             paymentStatus, guestId, editedBy,
    //                             success,
    //                             failure);
    //                     },
    //                     failure
    //                 );
    //             }
    //             else if (isWeekendOrder) {
    //                 dataDb.setPaymentStatus(
    //                     paymentStatus, guestId, editedBy,
    //                     success,
    //                     failure
    //                 );
    //             }
    //             else if (isShirtOrder) {
    //                 dataDb.setShirtStatus(
    //                     paymentStatus, guestId, editedBy,
    //                     success,
    //                     failure
    //                 );
    //             }
    //         }
    //         else {
    //             var note = 
    //                 "A payment for the weekend was received, but not logged, " +
    //                 "because the guest's email address (" + email + ") appears twice " + 
    //                 "in the system.";
    //             var error = paypal;
    //             emailer.sendErrorEmail(note, error, success, failure);
    //         }
    //     };

    //     var emailNotFound = function() {
    //         var note = 
    //             "A payment for the weekend was received, but not logged, " +
    //             "because the guest's email address (" + email + ") was not found.";
    //         var error = paypal;
    //         emailer.sendErrorEmail(note, error, success, failure);
    //     };

    //     db.findGuest(email, emailFound, emailNotFound);
    // }
    // else {
    //     // Not concerned about payments that get here.
    //     res.send(200);
    // }
});


module.exports = router;
