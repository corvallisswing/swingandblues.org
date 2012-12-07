//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012

var express = require('express');
var request = require('request');
var cradle  = require('cradle');
var secrets = require('./lib/secrets.js')

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
		return 'http://' + domain + ':' + serverPort;
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

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
var ensureAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  res.redirect(loginFailureUrl);
};


var db = function() {

	var couchHost = 'http://localhost';
	var couchPort = 5984;
	var databaseName = 'weekendrsvp';

	// Connect to Couch! 
	var database = new(cradle.Connection)(couchHost, couchPort, {
		cache: true,
		raw: false
	}).database(databaseName);

	var createViews = function() {
		// TODO: Add views to the database if they're
		// not present. This is a secondary priority,
		// as we can get by for now without this.
		// (The views are at least saved below, and were
		// already put in manually, for now.)

		var adminDesignDoc = {
			url: '_design/admin',
			body: 
			{
				guests: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.role = doc.dancer.role;
							p.from = doc.travel.zip;
							emit(doc.name, p);
						}
					}
				}
			}
      	};

      	// Create or update the design doc if something we 
      	// want is missing.
		database.get(adminDesignDoc.url, function (err, doc) {
			if (err || !doc.views || !doc.views.guests) {
				database.save(adminDesignDoc.url, adminDesignDoc.body); 
			}
		});
	};

	var createDatabaseAndViews = function() {
		// Create database!
		database.exists(function (err, exists) {
			if (err) {
				throw (err);
			}
			else if (exists) {
				createViews();
			}
			else {
				database.create();
				createViews();
			}
		});
	};

	createDatabaseAndViews();

	var isReady = false;

	var localhostUrl = "http://localhost:5984";
	var uuidUrl = localhostUrl + "/_uuids";
	var databaseUrl = localhostUrl + "/weekendrsvp";
	var designUrl   = databaseUrl + '/_design/rsvp';
	var getRolesUrl = designUrl + '/_view/roles?group=true';

	// 	// Create design document (with views)
	// 	request.get(designUrl, function (error, response, body) {

	// 		if (error) {
	// 			// Booooooo.
	// 			return;
	// 		}

	// 		var result = JSON.parse(body);
	// 		// Create the design document if it doesn't exist.
	// 		if (result.error && result.error === "not_found") {
	// 			var data = {
	// 				"_id": "_design/rsvp",
	// 				language: "javascript",
	// 				views: {
	// 					roles: {
	// 						map: function(doc) {
	// 							if (doc.dancer && doc.dancer.role) {
	// 									emit(doc.dancer.role, 1);
	// 							}
	// 						},
	// 						reduce: function (keys, values, rereduce) {
	// 							return sum(values);
	// 						}
	// 					}
	// 				}
	// 			};
	// 			var designDocument = {
	// 				uri : designUrl,
	// 				json : data
	// 			};

	// 			request.put(designDocument, function (error, response, body) {
	// 				if (error) { 
	// 					// TODO: Communication error!
	// 				}
	// 				else if (body.ok) {
	// 					// Stay cool.
	// 					isReady = true;
	// 				}
	// 				else {
	// 					// TODO: Freak out.
	// 				}
	// 			});
	// 		}
			
	// 	});
	// });


	var getRoles = function (success, failure) {

		request.get(getRolesUrl, function (error, response, body) {
			if (error) {
				failure(error);
				return;
			}

			success(body);
		});
	};

	var getGuests = function(success, failure) {
		database.view('admin/guests', function (error, response) {
			if (error) {
				failure(error);
				return;
			}

			var guests = [];
			response.forEach(function (row) {
				guests.push(row);
			});

			success(guests);
		});
	};

	return {
		roles : getRoles,
		guests : getGuests
	};
}(); // closure


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

		var remaining = Math.max(0, attendanceLimit - attendance);
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
var guests = function(success, failure) {

	var pass = function(data) {
		success(data);		
	};

	var fail = function(error) {
		// The database is probably sad.
		failure(error);		
	};

	db.guests(pass, fail);
};

app.get('/data/admin/user', ensureAuthenticated, function(req, res){
	res.send(req.user);
});

app.get('/data/admin/guests', ensureAuthenticated, function(req, res) {

	var success = function(result) {
		res.send(result);
	};

	var failure = function(error) {
		res.send(500, ':-(');
	};

	guests(success, failure);
});



// We get process.env.PORT from iisnode
var port = process.env.PORT || serverPort;
app.listen(port);