var db = require('./lib/data/survey');
var errors = require('./lib/errors');

var app;
var express = require('express');
var router = express.Router();

// Init session survey
var defaultSurvey = {
    overview: {},
    things: {},
    music: {}
};

router.use(function (req, res, next) {
    if (!req.session.survey) {
        req.session.survey = defaultSurvey;
    }

    // ensure one level of default properties
    for (var prop in defaultSurvey) {
        if (!req.session.survey[prop]) {
            req.session.survey[prop] = defaultSurvey[prop];
        }
    }

    // Make this available to all survey templates
    res.locals.survey = req.session.survey;
    next();
});

router.use(function (req, res, next) {
    res.locals.title = "Survey: Corvallis Swing and Blues Weekend";
    next();
});

router.get('/', function (req, res) {
    res.render('survey-start');
});

router.get('/things', function (req, res) {
    res.render('survey-things');
});

router.get('/music', function (req, res) {
    res.render('survey-music', {
        choices: [{ 
            data: 'not-there',
            label: "Wasn't there"
        },{
            data: 'sad',
            label: "Sad :-("
        },{
            data: 'hmm',
            label: 'Hmm :-\\'
        },{
            data: 'fun',
            label: 'Fun :-)'
        },{
            data: 'awesome',
            label: 'Awesome :-) :-)'
        },{
            data: 'favorite',
            label: 'My favorite ♥'
        }]
    });
});

router.get('/thanks', function (req, res) {
    res.render('survey-thanks');
});

router.put('/data', function (req, res) {
    var data = req.body;

    req.session.survey = data;
    req.session.save(errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.get('/data/reset', function (req, res) {
    req.session.destroy(errors.guard(res, function () {
        res.status(200).send();
    }));
});


var saveSurvey = function (req, res, next) {
    req.session.survey.meta = {};
    req.session.survey.meta.timestamp = Date.now();

    var survey = req.session.survey;

    console.log("SURVEY SUBMISSION:");
    console.log(JSON.stringify(survey));

    console.log(JSON.stringify(req.body));

    db.add(survey, errors.guard(res, function () {
        req.session.save(errors.guard(res, function () {
            next();
        }));
    }));
};


router.post('/data/submit', function (req, res) {
    saveSurvey(req, res, function () {
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

