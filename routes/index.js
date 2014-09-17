var express = require('express');
var router = express.Router();

var errors = require('./lib/errors');
var emailer = require('./lib/email/contactEmailer');

router.get('/', function(req, res) {
    res.render('index', { title: 'Corvallis Swing and Blues Weekend' });
});

router.get('/about', function(req, res) {
    res.redirect('/');
});

router.get('/schedule', function(req, res) {
    res.render('schedule', { title: 'Schedule: Corvallis Swing and Blues Weekend' });
});

router.get('/contact', function(req, res) {
    res.render('contact', { title: 'Contact Corvallis Swing and Blues Weekend' });
});

router.post('/contact', function(req, res) {
    var envelope = req.body;
    emailer.sendEmail(envelope, errors.guard(res, function () {
        res.status(200).send();
    }));
});

module.exports = router;
