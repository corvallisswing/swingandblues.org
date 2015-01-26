var db = require('./lib/data/survey');
var errors = require('./lib/errors');

var app;
var express = require('express');
var router = express.Router();

// Init session survey
var defaultSurvey = {
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

module.exports = function () {
    return {
        router: function (a) {
            app = a;
            return router;
        }
    }
}(); // closure

