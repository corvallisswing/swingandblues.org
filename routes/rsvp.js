var db = require('./lib/data/rsvp');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('rsvp', { title: 'Swing and Blues Weekend' });
});

router.get('/choose-your-adventure', function (req, res) {
    res.render('choose-adventure');
});

router.put('/data', function (req, res) {
    var data = req.body;
    console.log("STEP 1");
    db.add(data, function (err) {
        if (err) {
            return res.status(500).send(err);
        }
        return res.status(200).send("Ok!");
    });
});

router.get('/next', function (req, res) {
    res.redirect('/2');
});

module.exports = router;
