//----------------------------------------------------
// config.js
//
var isSoldOut = true;

// Use an overrides file so we can have something
// for local testing that is otherwise ignored
// in our repo.
var overrides;
try {
	overrides = require('./configOverrides.js');
}
catch (err) { 
	// Don't worry about it.
	// Set overrides to 'false' to allow to use
	// the || operator in the exports, below.
	overrides = false; 
}


exports.isSoldOut = function() {
	return overrides.isSoldOut || isSoldOut;
};
