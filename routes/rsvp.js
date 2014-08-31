var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('rsvp', { title: 'Swing and Blues Weekend' });
});

router.put('/data', function (req, res) {
    console.log("STEP 1");
    res.status(200).send("Ok!");
});

router.get('/next', function (req, res) {
    res.redirect('/2');
});

module.exports = router;
