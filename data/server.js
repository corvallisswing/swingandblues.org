//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012.

var express = require('express');
var request = require('request');
var secrets = require('./lib/secrets.js');
var db      = require('./lib/database.js').db;
var emailer = require('./lib/emailer.js');

var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;
//  , util = require('util')


var sessionSecret = secrets.sessionSecret(); 
var allowedUsers = secrets.allowedUsers();
var serverPort = 3000;

var loginFailureUrl = '/admin';
var googleReturnUrl = '/data/admin/auth/google/return';

var domain = 'whatever';
var hostUrl = function() {
	if (domain === 'localhost') {
		return 'http://' + domain;// + ':' + serverPort;
	}
	else {
		return 'http://' + domain;
	}
};

var initPassport = function() {
	// Use the GoogleStrategy within Passport.
	//   Strategies in passport require a `validate` function, which accept
	//   credentials (in this case, an OpenID identifier and profile), and invoke a
	//   callback with a user object.
	passport.use(new GoogleStrategy({
		returnURL: hostUrl() + googleReturnUrl,
		realm: hostUrl() + '/'
	},
	function(identifier, profile, done) {
	    // asynchronous verification, for effect...
	    process.nextTick(function () {

	      // To keep the example simple, the user's Google profile is returned to
	      // represent the logged-in user.  In a typical application, you would want
	      // to associate the Google account with a user record in your database,
	      // and return that user instead.
	      profile.identifier = identifier;
	      return done(null, profile);
	  });
	}
	));
};

// middleware that does a few things the first
// time it is called. we have this so that we
// can initialize passportjs with our domain name.
var isFirstRun = true;
var firstRun = function(req, res, next) {
	if (isFirstRun) {
		domain = req.host;
		initPassport();
		isFirstRun = false;
	}
	return next();
};

// From the passport demo:
//
// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Google profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
}); 


var app = express();
app.use(express.bodyParser());
app.use(firstRun);
// Required for passport:
app.use(express.cookieParser());
app.use(express.session({ secret: sessionSecret })); 
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

// GET /data/admin/auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve redirecting
//   the user to google.com.  After authenticating, Google will redirect the
//   user back to this application at /data/admin/auth/google/return
app.get('/data/admin/auth/google', 
  passport.authenticate('google', { failureRedirect: loginFailureUrl }),
   function(req, res) {
	// This response doesn't matter, because we get redirected
	// to /data/admin/auth/google/return anyway.
   	res.send(':-)');
   });


var authenticate = function(req, success, failure) {

	return passport.authenticate('google', 
		function (err, user, info) {

			if (err) { 
				failure(err);
			}
			else if (!user) { 
				failure("Invalid login data");
			}
			else {
				var primaryEmail = user.emails[0].value;
				if (allowedUsers.indexOf(primaryEmail) >= 0) {
					// req.login is added by the passport.initialize() middleware
					// to manage login state. We need to call it directly, as we're
					// overriding the default passport behavior.
					req.login(user, function(err) {
						if (err) { 
							failure(err);
						}
						success();
					});
				}
				else {
					failure("Unknown email address");
				}
			}
		}
	);
};

// Authentication. This defines what we send
// back to clients that want to authenticate
// with the system.
var authMiddleware = function(req, res, next) {

	var success = function() {
		// TODO: How does the client know whether it is authenticated?
		res.redirect('http://' + req.host + '/admin');
//		res.send(200, "Login successul");
	};

	var failure = function(error) {
		console.log(error);
		res.send(200, "Your email address isn't on the list of those who " + 
			"have access. Make sure you're using the Google account you're " +
			"intending to use, then ask Phil what's up (and give him the email " +
			"address you're using to log in)."); 
	};

	// The auth library provides middleware that
	// calls 'success' or 'failure' in the appropriate
	// login situation.
	var middleware = authenticate(req, success, failure);
	middleware(req, res, next);
};


// GET /data/auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get(googleReturnUrl, authMiddleware);

// Logout ...
app.get('/data/admin/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});




var roles = function(success, failure) {

	var pass = function(data) {

		var result = {
			lead: 0,
			follow: 0,
			both: 0
		};

		// Convert the raw CouchDB view into 
		// a simple JSON object.
		var rows = JSON.parse(data).rows;
		for (var index in rows) {
			var row = rows[index];
			result[row.key] = row.value;
		}

		success(result);		
	};

	var fail = function(error) {
		// The database is probably sad.
		failure(error);		
	};

	db.roles(pass, fail);
};

var getAttendanceLimit = function() {
	return 150;
};

//----------------------------------------------------------------
// Data: Public API
//----------------------------------------------------------------
app.get('/data/', function (req, res) {
	res.send(':-)');    
});

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


app.put('/data/admin/payments/status', ensureAuthenticated, function(req, res) {
	var action = req.body;
	db.setPaymentStatus(
		action.status, action.id, req.user.emails[0].value,
		function(data) {
			res.send(':-)');
		},
		function(err) {	
			// We could get here if two people are hitting the database
			// at the same time there is a save conflict.
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
			// We could get here if two people are hitting the database
			// at the same time there is a save conflict.
			res.send(500, err);
		}
	);
});



app.put('/data/admin/shirt/email', ensureAuthenticated, function(req, res) {
	var guest = req.body;
	var adminEmail = req.user.emails[0].value;

	emailer.sendShirtEmail(
		guest,
		function(data) {
			// TODO: Save status to db.
			db.setShirtStatus(
				'emailed', guest.id, adminEmail,
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


app.put('/data/admin/welcome/email', ensureAuthenticated, function(req, res) {
	var guest = req.body;
	var adminEmail = req.user.emails[0].value;

	emailer.sendWelcomeEmail(
		guest,
		function(data) {
			if (!guest.id) {
				console.log("Guest id is: " + guest.id);
			}

			db.setWelcomeStatus(
				true, guest.id, adminEmail,
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
});




app.put('/data/admin/survey/email', ensureAuthenticated, function(req, res) {
	var guest = req.body;
	var adminEmail = req.user.emails[0].value;

	emailer.sendSurveyEmail(
		guest,
		function(data) {
			if (!guest.id) {
				console.log("Guest id is: " + guest.id);
			}

			db.setSurveyedStatus(
				true, guest.id, adminEmail,
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
});


// We get process.env.PORT from iisnode
var port = process.env.PORT || serverPort;
app.listen(port);