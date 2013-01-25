//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012.

var express = require('express');
var request = require('request');
var cradle  = require('cradle');
var secrets = require('./lib/secrets.js');
var email   = require('emailjs');
var fs      = require('fs');

var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;
//  , util = require('util')

var smtpServer  = email.server.connect({
	user:    secrets.smtpUsername(), 
	password: secrets.smtpPassword(), 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

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
				},

				payments: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							p.payment = {};
							p.payment.method = doc.payment.method;
							p.payment.status = doc.payment.status || 'new';
							p.payment.amount = doc.payment.amount || 40;
							emit(p.name, p);
						}
					}
				},

				housing: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.from = doc.travel.zip;
							p.housing = {};
							p.housing.guest = doc.housing.guest;
							if (p.housing.guest) {
								emit(p.name, p);
							}
						}
					}
				},

				hosts: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.housing = {};
							p.housing.host = doc.housing.host;
							if (p.housing.host) {
								emit(p.name, p);
							}
						}
					}
				},

				shirts: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							p.shirt = {};
							p.experience = {};
							p.shirt.want = doc.shirt.want;
							if (p.shirt.want) {
								p.shirt.style = doc.shirt.style;
								p.shirt.size = doc.shirt.size;
								p.shirt.canHaz = doc.shirt.canHaz;
								p.shirt.status = doc.shirt.status || 'new';

								var site = 'swing';
								if (doc.experience) {
									site = doc.experience.site;
								}
								p.experience.site = site;

								emit(p.name, p);
							}
						}
					}
				},				

				carpool: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.travel = {};
							p.travel.carpool = doc.travel.carpool;
							p.travel.zip = doc.travel.zip;
							if (p.travel.carpool) {
								emit(p.travel.zip, p);
							}
						}
					}
				},

				train: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.travel = {};
							p.travel.train = doc.travel.train;
							if (p.travel.train) {
								emit(p.name, p);
							}
						}
					}
				},

				volunteers: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.volunteer = {};
							p.volunteer.want = doc.volunteer.want;
							if (p.volunteer.want) {
								emit(p.name, p);
							}
						}
					}
				},

				emails: {
					map: function(doc) {
							if (doc.email) {
								emit(doc.email, 1);
							}
					},
					reduce: function (keys, values, rereduce) {
						return sum(values);
					}
				},

				blues: {
					map: function(doc) {
						if (doc.name && doc.experience) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.experience = {};
							p.experience.site = doc.experience.site;
							if (p.experience.site === "blues") {
								emit(p.name, p);
							}
						}
					}
				},

				welcome: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							// TODO: Clean up
							if (doc.experience) {
								p.experience = doc.experience;

								if (doc.experience.welcomed) {
									p.experience.welcomed = doc.experience.welcomed; 
								}
								else {
									p.experience.welcomed = false;
								}
							}	
							else {
								p.experience = {};
								p.experience.welcomed = false;
							}													 
							
							emit(p.name, p);
						}
					}
				},

				all: {
					map: function(doc) {
						if (doc.name) {
							emit(doc.name, doc);
						}
					}
				}

			}
      	};

      	// Create or update the design doc if something we 
      	// want is missing.
      	var forceDesignDocSave = false;

		database.get(adminDesignDoc.url, function (err, doc) {
			if (err || !doc.views 
				|| !doc.views.guests
				|| !doc.views.payments
				|| !doc.views.housing
				|| !doc.views.hosts
				|| !doc.views.shirts
				|| !doc.views.carpool
				|| !doc.views.train
				|| !doc.views.volunteers
				|| !doc.views.emails
				|| !doc.views.blues
				|| !doc.views.welcome
				|| !doc.views.all
				|| forceDesignDocSave) {
				// TODO: Add a mechanism for knowing when views
				// themselves have updated, to save again at the
				// appropriate times.
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

	var getView = function(viewUrl, success, failure) {
		database.view(viewUrl, function (error, response) {
			if (error) {
				failure(error);
				return;
			}

			var docs = [];
			response.forEach(function (row) {
				docs.push(row);
			});

			success(docs);
		});
	}

	var getGuests = function(success, failure) {
		getView('admin/guests', success, failure);
	};

	var getPayments = function(success, failure) {
		getView('admin/payments', success, failure);
	};

	var getHousing = function(success, failure) {
		getView('admin/housing', success, failure);
	};

	var getHosts = function(success, failure) {
		getView('admin/hosts', success, failure);
	};

	var getShirts = function(success, failure) {
		getView('admin/shirts', success, failure);
	};

	var getCarpool = function(success, failure) {
		getView('admin/carpool', success, failure);
	};

	var getTrain = function(success, failure) {
		getView('admin/train', success, failure);
	};

	var getVolunteers = function(success, failure) {
		getView('admin/volunteers', success, failure);
	};

	var getEmailAddressCount = function(email, success, failure) {
		getView('admin/emails', {key: email}, success, failure);
	};

	var getBlues = function(success, failure) {
		getView('admin/blues', success, failure);
	};

	var getWelcome = function(success, failure) {
		getView('admin/welcome', success, failure);
	};

	var getAll = function(success, failure) {
		getView('admin/all', success, failure);
	};

	var _setPaymentStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;
			doc.payment.status = status;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	var _setPaymentAmount = function(amount, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;
			doc.payment.amount = amount;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	var _setShirtStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;
			doc.shirt.status = status;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	var _setWelcomeStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				console.log(err);
				return;
			}

			var rev = doc._rev;
			if (!doc.experience) {
				doc.experience = {};
			}
			doc.experience.welcomed = status;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				console.log(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	return {
		roles : getRoles,
		guests : getGuests,
		payments : getPayments,
		housing : getHousing,
		hosts : getHosts,
		shirts : getShirts,
		train : getTrain,
		carpool : getCarpool,
		volunteers : getVolunteers,
		emailAddressCount : getEmailAddressCount,
		blues : getBlues,
		welcome : getWelcome,
		setPaymentStatus : _setPaymentStatus,
		setPaymentAmount : _setPaymentAmount,		
		setShirtStatus : _setShirtStatus,
		setWelcomeStatus : _setWelcomeStatus,
		all : getAll
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

app.get('/data/admin/payments', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.payments(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});


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

var rawShirtEmail = function() {
	var message = fs.readFileSync('./shirtEmail.txt', 'utf8');
	return {
		txt : message
	}; 
}();

var rawWelcomeEmail = function() {
	var message = fs.readFileSync('./welcomeEmail.txt', 'utf8');
	return {
		txt : message
	}; 
}();

var getEventNameTxt = function(person) {
	var eventName = "Corvallis Swing & Blues Weekend";
	if (person.experience.site === "blues") {
		eventName = "Corvallis Blues & Swing Weekend";
	}
	return eventName;
};

var getEventUrl = function(person) {
	var eventUrl = "http://swingandblues.org";
	if (person.experience.site === "blues") {
		eventUrl = "http://bluesandswing.org";
	}
	return eventUrl;
};

var buildShirtEmailMessage = function (email, person) {
	var message = rawShirtEmail.txt;

	message = message.replace("{email}", email);
	message = message.replace(/{eventName}/g, getEventNameTxt(person));
	message = message.replace(/{eventUrl}/g, getEventUrl(person));

	return message;
};

var sendShirtEmail = function (person, success, failure) {

	var fromName = "Corvallis Swing & Blues"
	if (person.experience.site === "blues") {
		fromName = "Corvallis Blues & Swing";
	}

	var message = buildShirtEmailMessage(person.email, person);
 	var from    = fromName + " <glenn@corvallisswing.com>";
	var to      = "Guest <" + person.email + ">";
	var cc      = "lindy@corvallisswing.com";
	var subject = "Shirt order (please reply by Friday)";

	var emailPackage = {
		text:    message, 
		from:    from, 
		to:      to,
		cc:      cc,
		subject: subject
	};

	smtpServer.send(emailPackage,
 	function(err, message) {
 		if (err) {
 			failure(err);
 		} 
 		else {
 			success(message);
 		}		
	});
};

app.put('/data/admin/shirt/email', ensureAuthenticated, function(req, res) {
	var guest = req.body;
	var adminEmail = req.user.emails[0].value;

	sendShirtEmail(
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


app.get('/data/admin/housing', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.housing(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/housing/hosts', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.hosts(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/shirts', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.shirts(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/travel/carpool', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.carpool(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/travel/train', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.train(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/blues', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.blues(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/welcome', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.welcome(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

var buildWelcomeEmailMessage = function (email, person) {
	var message = rawWelcomeEmail.txt;

	message = message.replace(/{eventName}/g, getEventNameTxt(person));
	message = message.replace(/{eventUrl}/g, getEventUrl(person));

	return message;
};

var sendWelcomeEmail = function (person, success, failure) {

	var fromName = "Corvallis Swing & Blues"
	if (person.experience.site === "blues") {
		fromName = "Corvallis Blues & Swing";
	}

	var message = buildWelcomeEmailMessage(person.email, person);
 	var from    = fromName + " <glenn@corvallisswing.com>";
	var to      = "Guest <" + person.email + ">";
	var cc      = ""; //"lindy@corvallisswing.com";
	var subject = "welcome to " + fromName + " Weekend";

	var emailPackage = {
		text:    message, 
		from:    from, 
		to:      to,
		cc:      cc,
		subject: subject
	};

	smtpServer.send(emailPackage,
 	function(err, msg) {
 		if (err) {
 			console.log(err);
 			console.log(message);
 			console.log(emailPackage);
 			failure(err);
 		} 
 		else {
 			success(msg);
 		}		
	});
};

app.put('/data/admin/welcome/email', ensureAuthenticated, function(req, res) {
	var guest = req.body;
	var adminEmail = req.user.emails[0].value;

	sendWelcomeEmail(
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

app.get('/data/admin/volunteers', ensureAuthenticated, function(req, res) {
	// TODO: Something not dumb. Prob refactor what's above.
	db.volunteers(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});

app.get('/data/admin/all', ensureAuthenticated, function(req, res) {
// TODO: Something not dumb. Prob refactor what's above.
	db.all(function(data) {
		res.send(data);
	}, 
	function(err) {
		res.send(500, ':-(');
	});
});


// We get process.env.PORT from iisnode
var port = process.env.PORT || serverPort;
app.listen(port);