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

var renderRsvps = function (viewName, res) {
    rsvpData.allByName(errors.guard(res, function (rsvps) {
        var attendees = [];
        if (rsvps) {
            rsvps.forEach(function (rsvp) {
                if (rsvp.person && rsvp.person.isAttending !== false) {
                    attendees.push(rsvp);
                }
            });
        }

        res.render(viewName, {
            rsvps: rsvps,
            attendees: attendees
        });
    }));
};

router.get('/rsvps', ensureAuth, function (req, res) {
    renderRsvps('admin-rsvps', res);
});

router.get('/payment', ensureAuth, function (req, res) {
    renderRsvps('admin-payment', res);
});

router.get('/shirts', ensureAuth, function (req, res) {
    renderRsvps('admin-shirts', res);
});

router.get('/declines', ensureAuth, function (req, res) {
    rsvpData.allByName(errors.guard(res, function (rsvps) {
        var declines = [];
        rsvps.forEach(function (rsvp) {
            var person = rsvp.person || {};
            if (person.isAttending === false) {
                declines.push(rsvp);
            }
        })

        res.render('admin-declines', {
            declines: declines
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

router.get('/housing', ensureAuth, function (req, res) {
    renderRsvps('admin-housing', res);
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

router.put('/data/payment/status', ensureAuth, function (req, res) {
    var body = req.body;
    rsvpData.get(body.id, errors.guard(res, function (rsvp) {
        rsvp.payment.status = body.status;
        rsvp.meta.editedBy = req.user.id;
        rsvpData.update(rsvp, errors.guard(res, function () {
            res.status(200).send();
        }));
    }));
});

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
