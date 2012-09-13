//------------------------------------------------------------
// Process RSVP submissions to an event. Basically, we 
// save the registration to disk and send an email.
//
// Author: Phil
// Created: September 2012

var express  = require('express');
var email    = require('emailjs');
var fs       = require('fs');
var check    = require('validator').check;
var sanitize = require('validator').sanitize;

var app = express();
app.use(express.bodyParser());

var submitTarget = '/rsvp/submit/server.js';
var recordsPath = './records';

var smtpServer  = email.server.connect({
	user:    "(put amazon smtp user here)", 
	password:"(put amazon smtp password here)", 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

// A poor-man's, synchronized, filename generator.
var recordFilenameGenerator = function (basePath) {
	var counter = fs.readdirSync(basePath).length;	

	return {
		next : function() {
			counter++;
			// We probably need to do something like
			// this because of references for everyone
			// in JavaScript.
			return basePath + "/" + counter + ".txt";
		}
	};
}(recordsPath); // closure

// Handle PUT requests.
app.put(submitTarget, function (req, res) {
	
	var person = req.body;
	var data = JSON.stringify(person);

	// Make sure we know what we're dealing with.
	var email = ""; 
	try {
		email = sanitize(person.email).trim();
		check(email).isEmail(); 
	}
	catch (e) {
		// Client checks should stop us from getting here, so just fail and
		// don't worry about giving much detail.
		res.send(400,"We don't think the email address provided is legitimate. Sorry.");
		return;
	}

	var filename = recordFilenameGenerator.next();
	fs.exists(filename, function(exists) {
		if (!exists) {
			fs.writeFile(filename, data, function(err) {
				if (err) {
					// TODO: Problem saving to disk.
					res.send(500, data);
				}
			});			
		}
		else {
			// TODO: The recordCounter is broken. 
			// Send an email to the admin.
			res.send(409, "Sad :(");
		}
	});

	console.log(filename);

	// TODO: Build email message 

	// TODO: Send the message and get a callback with
	// an error or details of the message that was sent
	//
	// TODO: What happens if the email is rejected?
	// smtpServer.send({
	// 	text:    "Dear <guest ...>", 
	// 	from:    "Corvallis Swing Dance Society <glenn@corvallisswing.com>", 
	// 	to:      "Guest <...>",
	// 	cc:      "<glenn@corvallisswing.com>",
	// 	subject: "testing emailjs"
	// },
 	// function(err, message) { 
	// 	console.log(err || message); 
	// });
	
	res.send("Thanks!");
});

// For fun, do something with GET and POST.
app.get(submitTarget, function (req, res) {
	res.send(':-)');    
});
app.post(submitTarget, function (req, res) {
	res.send("Please PUT your stuff.");	
});

// We get process.env.PORT from iisnode
app.listen(process.env.PORT);