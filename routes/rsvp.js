var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('rsvp', { title: 'Swing and Blues Weekend' });
});

module.exports = router;
