//----------------------------------------------------
// auth.js
//
// The thing that knows about authentication.
//
var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

var allowedUsers = []; // TODO: secrets.allowedUsers();

var googleReturnUrl = '/auth/google/return';


var initPassport = function (hostUrl) {
	// Use the GoogleStrategy within Passport.
	//   Strategies in passport require a `validate` function, which accept
	//   credentials (in this case, an OpenID identifier and profile), and invoke a
	//   callback with a user object.
	passport.use(new GoogleStrategy({
		returnURL: hostUrl + googleReturnUrl,
		realm: hostUrl + '/'
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
		var url = req.protocol + "://" + req.get('Host');
		initPassport(url);
		isFirstRun = false;
	}
	return next();
};

// callback = fn(error, user);
var findUserById = function(id, callback) {
	callback(null, {
		id: id,
		name: "(Name!)",
		displayName: "(Display name!)"
	});
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
passport.serializeUser(function (user, done) {
 	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	findUserById(id, function (err, user) {
		done(err, user);
	});
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
				user.id = primaryEmail;
				if (false) {
				// TODO: if (allowedUsers.indexOf(primaryEmail) >= 0) {
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
		next();
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


exports.firstRun = firstRun;
exports.authMiddleware = authMiddleware;
exports.googleReturnUrl = googleReturnUrl;

var attach = function (app) {
	app.use(passport.initialize());
	// Use passport.session() middleware to support
	// persistent login sessions.
	app.use(passport.session());
};

exports.attach = attach;
exports.authenticate = authenticate;
