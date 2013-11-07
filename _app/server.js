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

var config = require('./config.js');
var secrets = require('./secrets.js');
var rsvpEmailer = require('./lib/rsvpEmailer.js');
var rsvpDatabase = require('./lib/rsvpDatabase.js');

var emailer = require('./lib/emailer.js');
var auth    = require('./lib/auth.js');
var dataDb  = require('./lib/database.js').db('weekendrsvp');
var surveyDb = require('./lib/database.js').db('weekendrsvp-2013');
var sessionSecret = secrets.sessionSecret(); 

var app = express();
app.use(express.bodyParser());
app.use(auth.firstRun);
// Required for passport:
app.use(express.cookieParser(sessionSecret));
app.use(express.session({ secret: sessionSecret })); 
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(auth.initialize());
app.use(auth.session());


//----------------------------------------------------------------
// Data: Public API
//----------------------------------------------------------------
app.get('/data/', function (req, res) {
	res.send(':-)');    
});

var roles = function(success, failure) {

	var pass = function(data) {

		var result = {
			lead: 0,
			follow: 0,
			both: 0
		};

		// TODO: This only works if there is at least one
		// of each type registered. 
		// 
		// The data returns in alphabetical order.
		result.both = data[0] || 0;
		result.follow = data[1] || 0;
		result.lead = data[2] || 0;

		success(result);	
	};

	var fail = function(error) {
		// The database is probably sad.
		failure(error);		
	};

	dataDb.roles(pass, fail);
};

// Number of leads, follows, boths attending
app.get('/data/roles/', function (req, res) {

	var success = function(result) {
		res.send(result);
	};

	var failure = function(error) {
		res.send(500, ':-('); 
	};

	roles(success, failure);
});

// Various things that change during the event that
// we need to make sure guests are aware of as they rsvp.
app.get('/data/situation/', function (req, res) {
	var situation = {};
	situation.isHousingWaitlistActive = config.isHousingWaitlistActive();
	situation.isFollowsSoldOut = config.isFollowsSoldOut();

	res.send(situation);
})

var getAttendanceLimit = function() {
	return 150;
};

// The number of guests allowed into the event
app.get('/data/attendance/limit/', function (req, res) {
	res.send(getAttendanceLimit().toString());
});

// The number of spaces remaining 
app.get('/data/attendance/remaining/', function (req, res) {
	
	var success = function(result) {
		var attendanceLimit = getAttendanceLimit();
		var attendance = 0;
		// Sum up the roles to get the total attendance.
		for (var key in result) {
			attendance += result[key];
		}

		var remaining = Math.max(0, attendanceLimit - attendance);
		if (config.isSoldOut()) {
			remaining = 0;
		}
		res.send(remaining.toString());
	};

	var failure = function(error) {
		res.send(500, ':-(');
	};

	roles(success, failure);		
});


//----------------------------------------------------------------
// Data: Authentication
//----------------------------------------------------------------

var loginFailureUrl = '/admin';

// GET /data/admin/auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /data/admin/auth/google/return
app.get('/data/admin/auth/google', 
  auth.authenticate('google', { failureRedirect: loginFailureUrl }),
   function(req, res) {
	// This response doesn't matter, because we get redirected
	// to /data/admin/auth/google/return anyway.
   	res.send(':-)');
   });


// GET /data/auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(auth.googleReturnUrl, auth.authMiddleware);

// Logout ...
app.get('/data/admin/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


//----------------------------------------------------------------
// Data: Protected API
//----------------------------------------------------------------

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be given a 401.
var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  res.send(401, "Nope.");
};

// For diagnostics
app.get('/data/admin/user', ensureAuthenticated, function(req, res){
	res.send(req.user);
});

// It's common to return the raw results from a Couch DB view back to our client, 
// and an unhelpful 500 response on failure. 
var rawDbResponse = function(dataDbFunction) {

	return function(req, res) {
		dataDbFunction(
			function(data) {
				res.send(data);
			},
			function(err) {
				res.send(500, ':-(');
			}
		);
	};
}

app.get('/data/survey/music', rawDbResponse(surveyDb.survey.music));

app.get('/data/admin/guests', ensureAuthenticated, rawDbResponse(dataDb.guests));
app.get('/data/admin/payments', ensureAuthenticated, rawDbResponse(dataDb.payments));
app.get('/data/admin/housing', ensureAuthenticated, rawDbResponse(dataDb.housing));
app.get('/data/admin/housing/hosts', ensureAuthenticated, rawDbResponse(dataDb.hosts));
app.get('/data/admin/shirts', ensureAuthenticated, rawDbResponse(dataDb.shirts));
app.get('/data/admin/travel/carpool', ensureAuthenticated, rawDbResponse(dataDb.carpool));
app.get('/data/admin/travel/train', ensureAuthenticated, rawDbResponse(dataDb.train));
app.get('/data/admin/blues', ensureAuthenticated, rawDbResponse(dataDb.blues));
app.get('/data/admin/welcome', ensureAuthenticated, rawDbResponse(dataDb.welcome));
app.get('/data/admin/surveyed', ensureAuthenticated, rawDbResponse(dataDb.surveyed));
app.get('/data/admin/volunteers', ensureAuthenticated, rawDbResponse(dataDb.volunteers));
app.get('/data/admin/all', ensureAuthenticated, rawDbResponse(dataDb.all));

// Get survey data from last year.
app.get('/data/admin/survey/all', ensureAuthenticated, rawDbResponse(surveyDb.survey.all));
app.get('/data/admin/survey/next-year', ensureAuthenticated, rawDbResponse(surveyDb.survey.nextYear));
app.get('/data/admin/survey/music', ensureAuthenticated, rawDbResponse(surveyDb.survey.music));
app.get('/data/admin/survey/dancers', ensureAuthenticated, rawDbResponse(surveyDb.survey.dancers));
app.get('/data/admin/survey/want-email', ensureAuthenticated, rawDbResponse(surveyDb.survey.wantEmail));

app.put('/data/admin/payments/status', ensureAuthenticated, function(req, res) {
	var action = req.body;
	dataDb.setPaymentStatus(
		action.status, action.id, req.user.emails[0].value,
		function(data) {
			res.send(':-)');
		},
		function(err) {	
			console.log(err);
			res.send(500, err);
		}
	);
});

app.put('/data/admin/payments/amount', ensureAuthenticated, function(req, res) {
	var action = req.body;
	dataDb.setPaymentAmount(
		action.amount, action.id, req.user.emails[0].value,
		function(data) {
			res.send(':-)');
		},
		function(err) {	
			res.send(500, err);
		}
	);
});


// TODO: Figure out how to detect dup emails:
app.put('/data/admin/email/count', ensureAuthenticated, function(req, res) {
	var guestEmail = req.body;

	dataDb.emailAddressCount(
		guestEmail,
		function(data) {
			res.send(data);
		},
		function(err) {	
			res.send(500, err);
	});
});

var emailResponsibly = function(sendEmail, setDatabaseStatus, statusVal) {

 	return function(req, res) {
		var guest = req.body;
		var adminEmail = req.user.emails[0].value;

		sendEmail(
			guest,
			function(data) {
				if (!guest.id) {
					console.log("Guest id is: " + guest.id);
				}

				setDatabaseStatus(
					statusVal, guest.id, adminEmail,
					function(data) {
						res.send(':-)');
					},
					function(err) {	
						// We could get here if two people are hitting the database
						// at the same time there is a save conflict.
						res.send(500, err);
					}
				);			
			},
			function(err) {	
				// We could get here if two people are hitting the database
				// at the same time there is a save conflict.
				res.send(500, err);
			}
		);
	};
};

app.put('/data/admin/shirt/email', ensureAuthenticated, 
	emailResponsibly(emailer.sendShirtEmail, dataDb.setShirtStatus, 'emailed'));

app.put('/data/admin/welcome/email', ensureAuthenticated, 
	emailResponsibly(emailer.sendWelcomeEmail, dataDb.setWelcomeStatus, true));
	
app.put('/data/admin/survey/email', ensureAuthenticated,
	emailResponsibly(emailer.sendSurveyEmail, dataDb.setSurveyedStatus, true));


//---------------------------------------------------------------
// RSVP
//---------------------------------------------------------------

var submitTarget = '/rsvp/submit/';
var recordsPath = './records';

var db = rsvpDatabase.db;
var oldDb = rsvpDatabase.oldDb;


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
	// Save to our rsvpDatabase.
	console.log(JSON.stringify(data)); // Useful when things go wrong.

	oldDb.add(data, success, 
		function(error) {
		// In the event of rsvpDatabase failure,
		// attempt to save the json data to disk.	
		console.log("Failed to save to rsvpDatabase: " + error);

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
	// Save to our rsvpDatabase.
	console.log(JSON.stringify(survey)); // Useful when things go wrong.
	oldDb.add(survey, success, failure);
};

app.get('/data/guest/:guestId', function (req, res) {
	var guestFound = function (data) {
		// Remove identifying data, like name and email address,
		// because that seems like the polite thing to do. The
		// computers can get by with just the _id.
		var guest = data[0];
		delete guest.name;
		delete guest.email;
		delete guest._rev;
		res.send(guest);
	};

	var failure = function (err) {
		console.log(err);
		res.send(500, "There was an error during guest lookup. Sorry.")
	};

	db.findGuestById(req.params.guestId, guestFound, failure);
});

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
			rsvpEmailer.sendEmail(email, person, emailPass, emailFail);
		}
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the rsvp info didn't work. Can you please tell us it broke?");
	};

	person.payment.amount = 50;
	if (!person.experience) {
		person.experience = {};
	}
	person.experience.timestamp = Date.now();

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

// This URL is specified in our Paypal account. It receives
// a JSON object for every payment to our account, not just
// weekend payments.
app.post('/rsvp/submit/payment/paypal/', function (req, res) {
	
	var paypal = req.body;
	var weekendItemNumbers = config.paypalWeekendItemNumbers();
	var shirtItemNumbers = config.paypalShirtItemNumbers();

	var isValidItemNumber = function (itemNumber) {
		return isWeekendItemNumber(itemNumber) || isShirtItemNumber(itemNumber);
	};

	var isWeekendItemNumber = function (itemNumber) {
		return (weekendItemNumbers.indexOf(itemNumber) >= 0);
	};

	var isShirtItemNumber = function (itemNumber) {
		return (shirtItemNumbers.indexOf(itemNumber) >= 0);
	};

	if (paypal.payment_status === 'Completed'
	 && paypal.item_number
  	 && paypal.option_selection1
  	 && isValidItemNumber(paypal.item_number)) {

		var email = paypal.option_selection1;
		var isShirtOrder = isShirtItemNumber(paypal.item_number);
		var isWeekendOrder = isWeekendItemNumber(paypal.item_number);

		var success = function () {
			res.send(200);
		};
		var failure = function (err) {
			console.log(err);
			res.send(200);
		};

		var emailFound = function(docs) {
			if (docs.length && docs.length === 1) {
				var guestData = docs[0];

				var editedBy = "Automated System";
				var paymentStatus = "received";
				var guestId = guestData._id;

				// TODO: This is dumb, and should be refactored.
				if (isWeekendOrder && isShirtOrder) {
					dataDb.setPaymentStatus(
						paymentStatus, guestId, editedBy,
						function (data) {
							dataDb.setShirtStatus(
								paymentStatus, guestId, editedBy,
								success,
								failure);
						},
						failure
					);
				}
				else if (isWeekendOrder) {
					dataDb.setPaymentStatus(
						paymentStatus, guestId, editedBy,
						success,
						failure
					);
				}
				else if (isShirtOrder) {
					dataDb.setShirtStatus(
						paymentStatus, guestId, editedBy,
						success,
						failure
					);
				}
		  	}
			else {
				var note = 
					"A payment for the weekend was received, but not logged, " +
					"because the guest's email address (" + email + ") appears twice " + 
					"in the system.";
				var error = paypal;
				emailer.sendErrorEmail(note, error, success, failure);
			}
		};

		var emailNotFound = function() {
			var note = 
				"A payment for the weekend was received, but not logged, " +
				"because the guest's email address (" + email + ") was not found.";
			var error = paypal;
			emailer.sendErrorEmail(note, error, success, failure);
		};

		db.findGuest(email, emailFound, emailNotFound);
	}
	else {
		// Not concerned about payments that get here.
		res.send(200);
	}
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

app.put('/rsvp/submit/no-shirt/', function (req, res) {
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
			databasePerson.shirt.want = false;

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