//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012

var express = require('express');
var request = require('request');
var secrets = require('./lib/secrets.js');
var db      = require('./lib/database.js').db;
var emailer = require('./lib/emailer.js');
var auth    = require('./lib/auth.js');

var sessionSecret = secrets.sessionSecret(); 
var serverPort = 3000;

var app = express();
app.use(express.bodyParser());
app.use(auth.firstRun);
// Required for passport:
app.use(express.cookieParser());
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

		result.lead = data[0];
		result.follow = data[1];
		result.both = data[2];

		success(result);	
	};

	var fail = function(error) {
		// The database is probably sad.
		failure(error);		
	};

	db.roles(pass, fail);
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

		// TODO: Make this a switch.
		// Registration is closed.
		var remaining = 0; // Math.max(0, attendanceLimit - attendance);
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
var rawDbResponse = function(dbFunction) {

	return function(req, res) {
		dbFunction(
			function(data) {
				res.send(data);
			},
			function(err) {
				res.send(500, ':-(');
			}
		);
	};
}

app.get('/data/admin/guests', ensureAuthenticated, rawDbResponse(db.guests));
app.get('/data/admin/payments', ensureAuthenticated, rawDbResponse(db.payments));
app.get('/data/admin/housing', ensureAuthenticated, rawDbResponse(db.housing));
app.get('/data/admin/housing/hosts', ensureAuthenticated, rawDbResponse(db.hosts));
app.get('/data/admin/shirts', ensureAuthenticated, rawDbResponse(db.shirts));
app.get('/data/admin/travel/carpool', ensureAuthenticated, rawDbResponse(db.carpool));
app.get('/data/admin/travel/train', ensureAuthenticated, rawDbResponse(db.train));
app.get('/data/admin/blues', ensureAuthenticated, rawDbResponse(db.blues));
app.get('/data/admin/welcome', ensureAuthenticated, rawDbResponse(db.welcome));
app.get('/data/admin/surveyed', ensureAuthenticated, rawDbResponse(db.surveyed));
app.get('/data/admin/volunteers', ensureAuthenticated, rawDbResponse(db.volunteers));
app.get('/data/admin/all', ensureAuthenticated, rawDbResponse(db.all));

app.get('/data/admin/survey/all', ensureAuthenticated, rawDbResponse(db.survey.all));
app.get('/data/admin/survey/next-year', ensureAuthenticated, rawDbResponse(db.survey.nextYear));

app.put('/data/admin/payments/status', ensureAuthenticated, function(req, res) {
	var action = req.body;
	db.setPaymentStatus(
		action.status, action.id, req.user.emails[0].value,
		function(data) {
			res.send(':-)');
		},
		function(err) {	
			res.send(500, err);
		}
	);
});

app.put('/data/admin/payments/amount', ensureAuthenticated, function(req, res) {
	var action = req.body;
	db.setPaymentAmount(
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

	db.emailAddressCount(
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
	emailResponsibly(emailer.sendShirtEmail, db.setShirtStatus, 'emailed'));

app.put('/data/admin/welcome/email', ensureAuthenticated, 
	emailResponsibly(emailer.sendWelcomeEmail, db.setWelcomeStatus, true));
	
app.put('/data/admin/survey/email', ensureAuthenticated,
	emailResponsibly(emailer.sendSurveyEmail, db.setSurveyedStatus, true));

// We get process.env.PORT from iisnode
var port = process.env.PORT || serverPort;
app.listen(port);