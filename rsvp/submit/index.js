var express = require('express');
var app = express.createServer();

app.get('/rsvp/submit/index.js', function (req, res) {
    res.send(':-)');
});

app.listen(process.env.PORT);