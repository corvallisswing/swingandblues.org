var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('admin', { title: 'Swing and Blues Weekend' });
});

module.exports = router;
