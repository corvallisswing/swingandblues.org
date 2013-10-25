//----------------------------------------------------
// config.js
//
var isSoldOut = false;
var isFollowsSoldOut = false;
var isHousingWaitlistActive = false;
var paypalItemNumbers = ['wknd2014'];

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

exports.isHousingWaitlistActive = function () {
	if (overrides && overrides.isHousingWaitlistActive) {
		return overrides.isHousingWaitlistActive();
	}
	return isHousingWaitlistActive;
};

exports.isFollowsSoldOut = function() {
	if (overrides && overrides.isFollowsSoldOut) {
		return overrides.isFollowsSoldOut();
	}
	return isFollowsSoldOut;
};

exports.isSoldOut = function() {
	if (overrides && overrides.isSoldOut) {
		return overrides.isSoldOut();
	}
	return isSoldOut;
};

exports.paypalItemNumbers = function() {
	if (overrides && overrides.paypalItemNumbers) {
		return overrides.paypalItemNumbers();
	}
	return paypalItemNumbers;
}
