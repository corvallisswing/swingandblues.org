//----------------------------------------------------
// emailer.js
//
// The thing that knows how to send emails.
//

var secrets = require('../secrets.js');
var email   = require('emailjs');
var fs      = require('fs');

var smtpServer  = email.server.connect({
	user:    secrets.smtpUsername(), 
	password: secrets.smtpPassword(), 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

var rawEmail = function(filename) {
	var message = fs.readFileSync(filename, 'utf8');
	return {
		txt : message
	};
};

// TODO: Figure out this path stuff. i.e. Why is this path
// relative to /data while the path to ./secrets.js is relative
// to /data/lib?
var rawShirtEmail = rawEmail('./lib/shirtEmail.txt');
var rawWelcomeEmail = rawEmail('./lib/welcomeEmail.txt'); 
var rawSurveyEmail = rawEmail('./lib/surveyEmail.txt');
var rawErrorEmail = rawEmail('./lib/errorEmail.txt');

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
	var subject = "Shirt order for " + fromName + " Weekend";

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

var buildSurveyEmailMessage = function (email, person) {
	var message = rawSurveyEmail.txt;

	message = message.replace(/{eventName}/g, getEventNameTxt(person));
	message = message.replace(/{eventUrl}/g, getEventUrl(person));

	return message;
};

var sendSurveyEmail = function (person, success, failure) {

	var fromName = "Corvallis Swing & Blues"
	if (person.experience.site === "blues") {
		fromName = "Corvallis Blues & Swing";
	}

	var message = buildSurveyEmailMessage(person.email, person);
 	var from    = fromName + " <glenn@corvallisswing.com>";
	var to      = "Guest <" + person.email + ">";
	var cc      = ""; //"lindy@corvallisswing.com";
	var subject = "guest survey from " + fromName + " Weekend";

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

var buildErrorEmailMessage = function (note, error) {
	var message = rawErrorEmail.txt;

	message = message.replace(/{note}/g, note);
	message = message.replace(/{error}/g, error);

	return message;
};

var sendErrorEmail = function (note, error, success, failure) {
	
	var message = buildErrorEmailMessage(note, error);
 	var from    = "Corvallis Swing & Blues <glenn@corvallisswing.com>";
	var to      = "lindy@corvallisswing.com";
	var subject = "Error during event processing";

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

exports.sendSurveyEmail = sendSurveyEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendShirtEmail = sendShirtEmail;
exports.sendErrorEmail = sendErrorEmail;