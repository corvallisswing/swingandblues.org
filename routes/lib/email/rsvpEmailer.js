//------------------------------------------------------------
// emailer.js
//
// ... you know, for emailing.

var nodemailer = require('nodemailer');
var fs       = require('fs');
var path     = require('path');
var settings = require('../settings');

var getOptionsTxt = function (rsvp) {
	// Complete the sentence: "We have you down for _________."
	var options = [];
	options.push("a weekend pass");

	if (rsvp.hosting.want) {
		options.push("possibly hosting");		
	}
	if (rsvp.housing.want) {
		options.push("possibly needing a place to stay");
	}
	if (rsvp.travel.train) {
		options.push("probably needing a ride from the Albany train station")
	}
	if (rsvp.travel.carpool) {
		options.push("a desire to be part of a carpool scheme")
	}
	if (rsvp.shirt.want && rsvp.shirt.canHaz) {
	 	options.push("a shirt");
	}
	if (rsvp.volunteer.before || rsvp.volunteer.during) {
		options.push("an interest in volunteering");
	}

	return combineOptionsIntoSentence(options);
};

var getOptionsDetailTxt = function (rsvp) { 
	// Complete the sentence: "We'll follow up when we have our ___________."
	var options = [];	
	
	if (rsvp.travel.train || rsvp.travel.carpool) {
		options.push("carpool plans determined");
	}
	if (rsvp.shirt.want) {
	 	options.push("shirt design ready");
	}
	if (rsvp.volunteer.before || rsvp.volunteer.during) {
		options.push("volunteer signup sheet good to go");
	}

	options.push("event schedule finalized");

	return combineOptionsIntoSentence(options);
};

var getEventNameTxt = function (rsvp) {

	var eventName = "Corvallis Swing & Blues Weekend";
	if (rsvp.meta.site === "blues") {
		eventName = "Corvallis Blues & Swing Weekend";
	}
	return eventName;
};

var getEventUrl = function (rsvp) {

	var eventUrl = "http://swingandblues.org";
	if (rsvp.meta.site === "blues") {
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
	var message = fs.readFileSync(path.join(__dirname, 'rsvpEmail.txt'), 'utf8');
	return {
		txt : message
	}; 
}();

var paymentMessages = function () {
	var cash = fs.readFileSync(path.join(__dirname, 'rsvp-cash.txt'), 'utf8');
	var check = fs.readFileSync(path.join(__dirname, 'rsvp-check.txt'), 'utf8');
	var paid = fs.readFileSync(path.join(__dirname, 'rsvp-paid.txt'), 'utf8');
	return {
		cash: cash,
		check: check,
		paid: paid
	};
}();

var getPaymentText = function (rsvp) {
	var method = rsvp.payment.method;

	if (method === "cash") {
		return paymentMessages.cash;
	}
	else if (method === "check") {
		return paymentMessages.check;
	}
	else if (method === "paypal") {
		// Paypal people should have paid already.
		var text = paymentMessages.paid;
		var amount = rsvp.payment.amount;
		if (rsvp.shirt.paid) {
			amount += rsvp.shirt.payment.amount;
		}
		text = text.replace("{amount}", amount.toString());
		return text;
	}
	else {
		return "";
	}
};

var buildEmailMessage = function (rsvp) {
	var message = rawEmail.txt;

	message = message.replace("{options}", getOptionsTxt(rsvp));
	message = message.replace("{payment}", getPaymentText(rsvp));
	message = message.replace("{email}", rsvp.person.email);
	message = message.replace("{options.detail}", getOptionsDetailTxt(rsvp));
	message = message.replace(/{eventName}/g, getEventNameTxt(rsvp));
	message = message.replace("{eventUrl}", getEventUrl(rsvp));

	return message;
};

var transporter; 

var sendEmail = function (rsvp, callback) {
	var fromName = "Corvallis Swing & Blues"
	if (rsvp.meta.site === "blues") {
		fromName = "Corvallis Blues & Swing";
	}

	var message = buildEmailMessage(rsvp);
 	var from    = fromName + " <glenn@corvallisswing.com>";
	var to      = "Guest <" + rsvp.person.email + ">";
	var cc      = "lindy@corvallisswing.com";
	var subject = "Weekend 2015 reservation";

	var mail = {
		text:    message, 
		from:    from, 
		to:      to,
		cc:      cc,
		subject: subject
	};

	var initTransporter = function (callback) { 
		settings.getAll(function (err, settings) {
			if (err) {
				return callback(err);
			}

			var canProceed = (settings['smtp-service'] &&
				settings['smtp-login'] &&
				settings['smtp-password']);

			if (!canProceed) {
				var msg = "Server does not have email configured.";
				var err = new Error(msg);
				return callback(err);
			}

			var service = settings['smtp-service'].value;
			var login = settings['smtp-login'].value;
			var password = settings['smtp-password'].value;

			transporter = nodemailer.createTransport({
				service: service,
				auth: {
					user: login,
					pass: password
				}
			});

			callback();
		});
	}

	if (transporter) {
		transporter.sendMail(mail, callback);
	}
	else {
		initTransporter(function (err) {
			if (err) {
				return callback(err);
			}
			transporter.sendMail(mail, callback);
		});
	}
};

exports.sendEmail = sendEmail;