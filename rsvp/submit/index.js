var express = require('express');
var email   = require('emailjs');

var app = express();
app.use(express.bodyParser());

var submitTarget = '/rsvp/submit/index.js';

var smtpServer  = email.server.connect({
	user:    "(put amazon smtp user here)", 
	password:"(put amazon smtp password here)", 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

app.put(submitTarget, function (req, res) {
	console.log(req.body);
	res.send("Thanks!");

	// send the message and get a callback with
	// an error or details of the message that was sent
	smtpServer.send({
		text:    "Test email ... ", 
		from:    "Corvallis Swing Dance Society <glenn@corvallisswing.com>", 
		to:      "Guest <...>",
		cc:      "<glenn@corvallisswing.com>",
		subject: "testing emailjs"
	}, 
	function(err, message) { 
		console.log(err || message); 
	});
});

// For fun, do something with GET and POST.
app.get(submitTarget, function (req, res) {
	res.send(':-)');    
});
app.post(submitTarget, function (req, res) {
	res.send("Please PUT your stuff.");	
});

// We get this PORT from iisnode
app.listen(process.env.PORT);