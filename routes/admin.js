var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    var displayName = "(unknown)";
    if (!req.isAuthenticated()) { 
        displayName = "UNAUTHENTICATED";
    }

    if (req.user) {
        displayName = req.user.displayName || "(undefined)";
    }
    
    res.render('admin', { 
        displayName: displayName,
        title: 'Swing and Blues Weekend' 
    });
});

var ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) { 
    return next(); 
    }
    res.status(401).send("Nope.");
};

router.get('/protected', ensureAuthenticated, function (req, res) {
    res.status(200).send("Ok!");
});


module.exports = router;
