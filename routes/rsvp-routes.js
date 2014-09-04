var db = require('./lib/data/rsvp');
var errors = require('./lib/errors');

var express = require('express');
var router = express.Router();

// Init session rsvp 
router.use(function (req, res, next) {
    if (!req.session.rsvp) {
        // defaults ...
        req.session.rsvp = {
            person: {},
            shirt: {},
            food: {
                diet: {},
                allergies: {}
            }
        };
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
    res.render('choose-adventure', { 
        person: req.session.rsvp.person
    });
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

router.put('/person', function (req, res) {
    var data = req.body;

    req.session.rsvp.person = data;
    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});


// router.put('/data', function (req, res) {
//     var data = req.body;
//     console.log("STEP 1");
//     db.add(data, function (err) {
//         if (err) {
//             return res.status(500).send(err);
//         }
//         return res.status(200).send("Ok!");
//     });
// });

// router.get('/next', function (req, res) {
//     res.redirect('/2');
// });

module.exports = router;
