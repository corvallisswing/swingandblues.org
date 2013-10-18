//------------------------------------------------------------
// emailer.js
//
// ... you know, for emailing.

var secrets = require('../secrets.js');
var email   = require('emailjs');
var fs      = require('fs');

var smtpServer  = email.server.connect({
	user:    secrets.smtpUsername(), 
	password: secrets.smtpPassword(), 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

var getOptionsTxt = function (person) {
	// Complete the sentence: "We have you down for _________."
	var options = [];
	options.push("a weekend pass");

	if (person.housing.host) {
		options.push("possibly hosting");		
	}
	if (person.housing.guest) {
		options.push("possibly needing a place to stay");
	}
	if (person.travel.train) {
		options.push("probably needing a ride from the Albany train station")
	}
	if (person.travel.carpool) {
		options.push("a desire to be part of a carpool scheme")
	}
	if (person.shirt.want) {
		options.push("maybe wanting a shirt");
	}
	if (person.volunteer.want) {
		options.push("an interest in volunteering");
	}

	return combineOptionsIntoSentence(options);
};


var getOptionsDetailTxt = function (person) { 
	// Complete the sentence: "We'll follow up when we have our ___________."
	var options = [];	
	
	if (person.travel.train || person.travel.carpool) {
		options.push("carpool plans determined");
	}
	if (person.shirt.want) {
		options.push("shirt design ready");
	}
	if (person.housing.guest) {
		options.push("housing survey prepared");
	}	
	if (person.volunteer.want) {
		options.push("volunteer signup sheet good to go");
	}

	options.push("event schedule finalized");

	return combineOptionsIntoSentence(options);
};

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

var combineOptionsIntoSentence = function (options) {
	var sentence = "";

	var isMoreThanOneOption = options.length > 1;
	var areMoreThanTwoOptions = options.length > 2;
	var and = areMoreThanTwoOptions ? ", and " : " and ";

	for (var i=0; i < options.length; i++) {
		sentence += options[i];

		if (isMoreThanOneOption) {
			if (i === options.length - 1) {
				// Last option. Do nothing.
			}			
			else if (i === options.length - 2) {				
				sentence += and;
			}
			else {
				sentence += ", ";
			}
		}
	}

	return sentence;
};

var rawEmail = function() {
	var message = fs.readFileSync('./lib/email.txt', 'utf8');
	return {
		txt : message
	}; 
}();

var buildEmailMessage = function (email, person) {
	var message = rawEmail.txt;

	message = message.replace("{options}", getOptionsTxt(person));
	message = message.replace("{email}", email);
	message = message.replace("{options.detail}", getOptionsDetailTxt(person));
	message = message.replace(/{eventName}/g, getEventNameTxt(person));
	message = message.replace("{eventUrl}", getEventUrl(person));

	return message;
};

var sendEmail = function (email, person, success, failure) {

	var fromName = "Corvallis Swing & Blues"
	if (person.experience.site === "blues") {
		fromName = "Corvallis Blues & Swing";
	}

	var message = buildEmailMessage(email, person);
 	var from    = fromName + " <glenn@corvallisswing.com>";
	var to      = "Guest <" + email + ">";
	var cc      = "lindy@corvallisswing.com";
	var subject = "Weekend reservation";

	smtpServer.send({
		text:    message, 
		from:    from, 
		to:      to,
		cc:      cc,
		subject: subject
	},
 	function(err, message) {
 		if (err) {
 			failure(err);
 		} 
 		else {
 			success(message);
 		}		
	});
};

exports.sendEmail = sendEmail;