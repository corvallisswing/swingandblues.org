var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    console.log(req.user);
    res.render('admin', { 
        displayName: req.user && req.user.displayName,
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
