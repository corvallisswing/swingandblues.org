//------------------------------------------------------------
// Process RSVP submissions to an event. Basically, we 
// save the registration to disk and send an email.
//
// Author: Phil
// Created: September 2012

var express  = require('express');
var fs       = require('fs');
var check    = require('validator').check;
var sanitize = require('validator').sanitize;
var request  = require('request');

var secrets = require('./lib/secrets.js');
var emailer = require('./lib/emailer.js');
var database = require('./lib/database.js');

var app = express();
app.use(express.bodyParser());

var submitTarget = '/rsvp/submit/';
var recordsPath = './records';

var db = database.db;
var oldDb = database.oldDb;


// A poor-man's, synchronized, filename generator.
var recordFilenameGenerator = function (basePath) {
	// This will break if you delete any records from
	// the folder ... good thing it's just an emergency
	// backup.
	var counter = fs.readdirSync(basePath).length;	
	return {
		next : function() {
			counter++;
			return basePath + "/" + counter + ".txt";
		}
	};
}(recordsPath); // closure


var saveData = function (data, success, failure) {
	// Save to our database.
	console.log(JSON.stringify(data)); // Useful when things go wrong.

	oldDb.add(data, success, 
		function(error) {
		// In the event of database failure,
		// attempt to save the json data to disk.	
		console.log("Failed to save to database: " + error);

		var filename = recordFilenameGenerator.next();

		var writeFile = function (filename, data) {
			fs.writeFile(filename, data, 
				function(err) {
					if (err) {
						failure(err);
					}
					else {					
						success(filename);
					}
				});		
		};

		fs.exists(filename, 
		function (exists) {
			!exists ? writeFile(filename, JSON.stringify(data)) : failure("Sad :(");
		});
	});
};

var saveSurvey = function (survey, success, failure) {
	// Save to our database.
	console.log(JSON.stringify(survey)); // Useful when things go wrong.
	oldDb.add(survey, success, failure);
};


// Handle PUT requests.
app.put(submitTarget, function (req, res) {
	
	var person = req.body;

	// Make sure we know what we're dealing with.
	var email = ""; 
	try {
		email = sanitize(person.email).trim();
		check(email).isEmail(); 
	}
	catch (e) {
		// Client checks should stop us from getting here, so just fail and
		// don't worry about giving much detail.
		console.log("Invalid email received: " + email);
		res.send(400,"We don't think the email address provided is legitimate. Sorry.");
		return;
	}

	// Various callbacks ... 
	// It's probably easiest to read this 
	// from the bottom to the top.
	var emailPass = function() {
		res.send("Thanks!");	
	};

	var emailFail = function(err) {
		console.log(err);
		res.send(500,"Sending the email didn't work. Can you please tell us it broke?");
	};

	var savePass = function(info) {
		// After we save, send out an email.
		// If we're running locally, don't.
		if (req.host === "localhost") {
			console.log(info);
			res.send(":-)");
		}
		else {
			emailer.sendEmail(email, person, emailPass, emailFail);
		}
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the rsvp info didn't work. Can you please tell us it broke?");
	};

	person.payment.amount = 50;

	// Save the data to the disk.
	saveData(person, savePass, saveFail);
});

// For fun, do something with GET and POST.
app.get(submitTarget, function (req, res) {
	res.send(':-)');    
});
app.post(submitTarget, function (req, res) {
	res.send("Please PUT your stuff.");	
});

app.get('/rsvp/submit/shirt/', function (req, res) {
	res.send('yay, shirts. :-)');
});

app.put('/rsvp/submit/shirt/', function (req, res) {
	var person = req.body;

	// Make sure we know what we're dealing with.
	var email = ""; 
	try {
		email = sanitize(person.email).trim();
		check(email).isEmail(); 
	}
	catch (e) {
		// Client checks should stop us from getting here, so just fail and
		// don't worry about giving much detail.
		console.log("Invalid email received: " + email);
		res.send(400,"We don't think the email address provided is legitimate. Sorry.");
		return;
	}

	var emailFound = function(docs) {
		if (docs.length && docs.length === 1) {
			var databasePerson = docs[0];
			databasePerson.shirt.canHaz = person.shirt.canHaz;
			databasePerson.shirt.style = person.shirt.style;
			databasePerson.shirt.size = person.shirt.size;
			databasePerson.shirt.want = true;

			db.setShirtData(databasePerson.shirt, databasePerson._id, 
				function() {
					// Success
					res.send(200,"Ok!");
				},
				function(err) {
					// Failure
					console.log(err);
					res.send(501, "Failure.");
				}
			);
	  	}
		else {
			res.send(400, "Too many emails.");
		}
	};

	var emailNotFound = function() {
		res.send(400, "Not found. Boo.");
	};

	db.findGuest(email, emailFound, emailNotFound);
});


app.put('/rsvp/submit/shirt/query', function (req, res) {
	var person = req.body;

	// Make sure we know what we're dealing with.
	var email = ""; 
	try {
		email = sanitize(person.email).trim();
		check(email).isEmail(); 
	}
	catch (e) {
		// Client checks should stop us from getting here, so just fail and
		// don't worry about giving much detail.
		console.log("Invalid email received: " + email);
		res.send(400,"We don't think the email address provided is legitimate. Sorry.");
		return;
	}

	var emailFound = function(docs) {
		if (docs.length && docs.length === 1) {
			var databasePerson = docs[0];
			if (databasePerson.shirt.canHaz) {
				res.send(databasePerson.shirt);	
			}
	  	}
		else {
			res.send(400, "Too many emails.");
		}
	};

	var emailNotFound = function() {
		res.send(400, "Not found. Boo.");
	};

	db.findGuest(email, emailFound, emailNotFound);
});

app.get('/rsvp/submit/survey/', function (req, res) {
	res.send('yay, surveys. :-) :-)');
});

app.put('/rsvp/submit/survey/', function (req, res) {

	var survey = req.body;

	var savePass = function(info) {
		// If we're running locally, log stuff.
		if (req.host === "localhost") {
			console.log(info);
			res.send(":-)");
		}
		else {
			res.send("Thank you. :-)");
		}
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the survey didn't work. Can you please tell us it broke?");
	};

	saveSurvey(survey, savePass, saveFail);
});


// We get process.env.PORT from iisnode
var port = process.env.PORT || 3001;
app.listen(port);