//----------------------------------------------------
// secrets.js
//
// All the secrets are in one file, 
// to make deployment easier.


var sessionSecret = "(REPLACE_WITH_SOMETHING_RANDOM)";
var allowedUsers = [
	'replace@what.com',
	'auth@ok.com'
];


// Use an overrides file so we can have something
// for local testing that is otherwise ignored
// in our repo.
var overrides;
try {
	overrides = require('./secretsOverrides.js');
}
catch (err) { 
	// Don't worry about it.
	// Set overrides to 'false' to allow to use
	// the || operator in the exports, below.
	overrides = false; 
}


exports.sessionSecret = function() {
	return overrides.sessionSecret || sessionSecret;
};

exports.allowedUsers = function() {
	return overrides.allowedUsers || allowedUsers;
}