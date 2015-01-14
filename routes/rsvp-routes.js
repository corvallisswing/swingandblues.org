var db = require('./lib/data/rsvp');
var errors = require('./lib/errors');
var emailer = require('./lib/email/rsvpEmailer');
var stripe = require('./lib/stripe');

var app;
var express = require('express');
var router = express.Router();

// Init session rsvp 
var defaultRsvp = {
    person: {},
    travel: {},
    hosting: {},
    housing: {},
    shirt: {
        payment: {}
    },
    food: {
        diet: {},
        allergies: {}
    },
    volunteer: {},
    meta: {},
    payment: {}
};

router.use(function (req, res, next) {
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

router.use(function (req, res, next) {
    res.locals.title = "RSVP: Corvallis Swing and Blues Weekend";

    var settings = app.get('settings');
    if (settings && settings['rsvp-shirt-deadline']) {
        if (Date.now() <= Date.parse(settings['rsvp-shirt-deadline'].value)) {
            res.locals.isShirtAllowed = true;
        }
    }

    if (settings && settings['rsvp-housing-deadline']) {
        if (Date.now() <= Date.parse(settings['rsvp-housing-deadline'].value)) {
            res.locals.isHousingAllowed = true;
        }
    }

    next();
});

router.get('/', function (req, res) {
    res.render('rsvp-start', { 
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
            {key: 'curare', name: 'Curare'},
            {key: 'treeNuts', name: 'Tree nuts'},
            {key: 'fish', name: 'Fish'},
            {key: 'hemlock', name: 'Hemlock'},
            {key: 'shellfish', name: 'Shellfish'},
            {key: 'soy', name: 'Soy'},
            {key: 'wheat', name: 'Wheat'}
        ]
    });
});

router.get('/hosting', function (req, res) {
    res.render('rsvp-hosting');
});

router.get('/shirt', function (req, res) {
    res.render('rsvp-shirt', {
        mens: [
            {key: 'xs', name: 'XS', chest: '32-34', waist: '25-27'},
            {key: 's', name: 'S', chest: '35-36', waist: '28-30'},
            {key: 'm', name: 'M', chest: '37-39', waist: '31-33'},
            {key: 'l', name: 'L', chest: '40-42', waist: '34-36'},
            {key: 'xl', name: 'XL', chest: '43-45', waist: '37-39'},
            {key: '2xl', name: '2XL', chest: '46-48', waist: '40-42'}
        ],
        womens: [
            {key: 'xs', name: 'XS', size: '0/1', chest: '30-31'},
            {key: 's', name: 'S', size: '3/5', chest: '32-33'},
            {key: 'm', name: 'M', size: '7/9', chest: '34-35'},
            {key: 'l', name: 'L', size: '11/13', chest: '36-37'},
            {key: 'xl', name: 'XL', size: '15/17', chest: '38-40'},
            {key: '2xl', name: '2XL', size: '19/21', chest: '41-43'}
        ]
    });
});

router.get('/payment', function (req, res) {
    // TODO: Invalidate cache when key is set.
    var stripeKey = "(not set on server)";
    var settings = app.get('settings');
    if (settings && settings['stripe-public-key']) {
        stripeKey = settings['stripe-public-key'].value;
    }

    var canHazCards = req.secure && stripe.canHaz();
    res.render('rsvp-payment', {
        canHazCards: canHazCards,
        stripeKey: stripeKey
    });
});

router.get('/paid', function (req, res) {
    res.render('rsvp-paid');
});

router.get('/thanks', function (req, res) {
    res.render('rsvp-thanks');
});

router.get('/declined', function (req, res) {
    res.render('rsvp-declined');
})

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

router.put('/data/shirt', function (req, res) {
    var data = req.body;

    req.session.rsvp.shirt = data;

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
    }));
});

router.put('/data/session', function (req, res) {
    var data = req.body;
    // Only save the properties that we get.
    for (var propName in defaultRsvp) {
        if (data[propName]) {
            req.session.rsvp[propName] = data[propName]    
        }
    }
    req.session.save(errors.guard(res, function() {
        res.status(200).send();
    }));
});

var addCardMetadata = function (rsvp) {
    rsvp.payment.status = "received";

    if (rsvp.shirt.isBuying) {
        var payment = {};
        payment.method = "card";
        payment.status = "received";
        payment.amount = 15;

        rsvp.shirt.paid = true;
        rsvp.shirt.payment = payment;
    }

    return rsvp;
};

var saveRsvp = function (req, res, next) {
    req.session.rsvp.meta.submitted = true;
    req.session.rsvp.meta.timestamp = Date.now();
    req.session.rsvp.payment.amount = 50; // weekend pass

    var rsvp = req.session.rsvp;

    if (rsvp.payment.method === 'card') {
        rsvp = addCardMetadata(rsvp);
        // TODO: Do we need this? 
        req.session.rsvp = rsvp;
    }

    console.log("RSVP SUBMISSION:");
    console.log(JSON.stringify(rsvp));

    db.add(rsvp, errors.guard(res, function () {
        if (req.hostname === "localhost") {
            // Skip the emails for now.
            req.session.save(errors.guard(res, function () {
                next();
            }));
        }
        else {
            if (rsvp.person.isAttending === false) {
                // Do nothing
                next();
            }
            else {
                emailer.sendEmail(rsvp, errors.guard(res, function () {
                    req.session.save(errors.guard(res, function () {
                        next();
                    }));
                }));        
            }
        }
    }));
};

router.post('/paid', function (req, res) {
    // We get here from Paypal.
    var data = req.body;

    var meta = {};
    meta.transactionId = data.txn_id;
    meta.date = data.payment_date;
    meta.status = data.payment_status;
    meta.itemNumber = data.item_number;
    meta.payerEmail = data.payer_email;
    meta.gross = data.mc_gross;

    req.session.rsvp.payment.meta = meta;
    req.session.rsvp.payment.method = "paypal";
    req.session.rsvp.payment.status = "received";

    // TODO: Put item number in config
    if (meta.itemNumber === 'wknd2015s') {
        var payment = {};
        payment.method = "paypal";
        payment.status = "received";
        payment.amount = 15;

        req.session.rsvp.shirt.paid = true;
        req.session.rsvp.shirt.payment = payment;
    }

    saveRsvp(req, res, function () {
        res.render('rsvp-paid');
    });
});


router.post('/data/submit', function (req, res) {
    saveRsvp(req, res, function () {
        res.status(200).send();
    });
});

module.exports = function () {
    return {
        router: function (a) {
            app = a;
            return router;
        }
    }
}(); // closure
