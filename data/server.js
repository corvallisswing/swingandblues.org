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

// TODO: Put in deploy.secrets file.
var sessionSecret = secrets.sessionSecret(); 
var allowedUsers = secrets.allowedUsers();
var serverPort = 3000;

var domain = 'localhost';
var hostUrl = function() {
	if (domain === 'localhost') {
		return 'http://' + domain + ':' + serverPort;
	}
	else {
		return 'http://' + domain;
	}
};

// middleware that saves the domain for each request.
var saveDomain = function(req, res, next) {
	domain = req.host;
	return next();
}

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

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `validate` function, which accept
//   credentials (in this case, an OpenID identifier and profile), and invoke a
//   callback with a user object.
passport.use(new GoogleStrategy({
    returnURL: hostUrl() + '/data/admin/auth/google/return',
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


var app = express();
app.use(express.bodyParser());
app.use(saveDomain);
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
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
  	res.send(':-)');
//    res.redirect('/data/user'); // TODO: Redirect. :-)
  });

// GET /data/auth/google/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/data/admin/auth/google/return', 
  passport.authenticate('google', { failureRedirect: '/admin' }),
  function(req, res) {

  	//res.send(':-) :-)');
    res.redirect('/data/admin/user'); // TODO: Redirect. :-)
  });

app.get('/data/admin/user', ensureAuthenticated, function(req, res){
  // res.render('account', { user: req.user });
  res.send(req.user);
});

app.get('/data/admin/auth/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); 
  }
  res.redirect('/admin')
}


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

	//var couch = couchdb.srv(localhostUrl).db("weekendrsvp");

	// Create database.
	// request.get(databaseUrl, function (error, response, body) {
	// 	if (error) {
	// 		console.log("Error creating database. Do you have CouchDB installed?");
	// 		return;
	// 	}
	// });

	// 	// TODO: Don't assume that the database was created
	// 	// successfully.

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

	return {
		roles : getRoles
	};
}(); // closure

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

		var remaining = Math.max(0, attendanceLimit - attendance);
		res.send(remaining.toString());
	};

	var failure = function(error) {
		res.send(500, ':-(');
	};

	roles(success, failure);		
});

// We get process.env.PORT from iisnode
var port = process.env.PORT || serverPort;
app.listen(port);