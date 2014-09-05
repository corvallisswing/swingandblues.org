var express = require('express');
var router = express.Router();

var settings = require('./lib/settings');
var errors = require('./lib/errors');

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

router.get('/settings', ensureAuth, function (req, res) {
    settings.getAllForDisplay(function (err, data) {
        var displaySettings = [];
        for (var index in data) {
            var setting = data[index];
            if (setting.kind !== "list") {
                displaySettings.push(setting);
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

router.put('/data/setting', ensureAuth, function (req, res) {
    var data = req.body;
    var list = [];
    list.push(data);
    settings.set(list, errors.guard(res, function () {
        res.status(200).send();
    }));
});

router.get('/protected', ensureAuth, function (req, res) {
    res.status(200).send("Ok!");
});




module.exports = router;
