var db = require('./lib/data/rsvp');
var errors = require('./lib/errors');

var express = require('express');
var router = express.Router();

// Init session rsvp 
router.use(function (req, res, next) {
    var defaultRsvp = {
        person: {},
        travel: {},
        shirt: {},
        food: {
            diet: {},
            allergies: {}
        }
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

router.get('/data', function (req, res) {
    res.status(200).send(req.session.rsvp);
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

module.exports = router;
