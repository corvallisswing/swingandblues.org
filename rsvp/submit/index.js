var express = require('express');
var app = express();

app.use(express.bodyParser());

app.get('/rsvp/submit/index.js', function (req, res) {
    res.send(':-)');    
});

app.post('/rsvp/submit/index.js', function (req, res) {
	res.send("Please PUT your stuff.");	
});

app.put('/rsvp/submit/index.js', function (req, res) {
	console.log(req.body);
	res.send("Thanks!");	
});

app.listen(process.env.PORT);