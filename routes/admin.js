var express = require('express');
var router = express.Router();

var rsvpData = require('./lib/data/rsvp');
var settings = require('./lib/settings');
var errors = require('./lib/errors');
var auth = require('./lib/auth');

var ensureAuth = function(req, res, next) {
    if (req.isAuthenticated()) { 
    return next(); 
    }
    res.status(401).send("Nope.");
};

router.get('/', function (req, res) {
    var displayName = "(unknown)";
    if (!req.isAuthenticated()) { 
        displayName = "(unauthenticated)";
    }

    if (req.user) {
        displayName = req.user.displayName || "(undefined)";
    }

    res.render('admin-index', { 
        displayName: displayName,
        title: 'Swing and Blues Weekend' 
    });
});

router.get('/rsvps', ensureAuth, function (req, res) {
    rsvpData.allByName(errors.guard(res, function (rsvps) {
        res.render('admin-rsvps', {
            rsvps: rsvps
        });
    }));
});

router.get('/volunteers', ensureAuth, function (req, res) {
    rsvpData.allByName(errors.guard(res, function (rsvps) {
        var volunteers = [];
        rsvps.forEach(function (rsvp) {
            var volunteer = rsvp.volunteer || {};
            if (volunteer.before || volunteer.during) {
                volunteers.push(rsvp);
            }
        });

        res.render('admin-volunteers', {
            volunteers: volunteers
        });
    }));
});

router.get('/settings', ensureAuth, function (req, res) {
    settings.getAllForDisplay(function (err, data) {
        var displaySettings = {};
        for (var index in data) {
            var setting = data[index];
            if (setting.kind !== "list") {
                displaySettings[setting.name] = setting;
            }
        }

        res.render('admin-settings', {
            settings: displaySettings
        });
    });
});

router.get('/access', ensureAuth, function (req, res) {
    settings.getAllForDisplay(function (err, data) {
        var accessSetting = data["admin-access-list"] || {};
        res.render('admin-access', {
            settings: data,
            accessSetting: accessSetting
        });
    });
});

var saveSetting = function (setting, callback) {
    var list = [];
    list.push(setting);
    settings.set(list, callback);
};

router.put('/data/setting', ensureAuth, function (req, res) {
    saveSetting(req.body, errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.put('/data/setting/access-list', ensureAuth, function (req, res) {
    saveSetting(req.body, errors.guard(res, function () {
        auth.setAccessList(req.body.value);
        res.status(200).send();
    }));
});


// For testing auth middleware
router.get('/protected', ensureAuth, function (req, res) {
    res.status(200).send("Ok!");
});


module.exports = router;
