//------------------------------------------------------------
// Process RSVP submissions to an event. Basically, we 
// save the registration to disk and send an email.
//
// Author: Phil
// Created: September 2012

var express  = require('express');
var email    = require('emailjs');
var fs       = require('fs');
var check    = require('validator').check;
var sanitize = require('validator').sanitize;

var app = express();
app.use(express.bodyParser());

var submitTarget = '/rsvp/submit/server.js';
var recordsPath = './records';

var smtpServer  = email.server.connect({
	user:    "(put amazon smtp user here)", 
	password:"(put amazon smtp password here)", 
	host:    "email-smtp.us-east-1.amazonaws.com", 
	ssl:     true
});

var rawEmailTxt = function() {
	var message = fs.readFileSync('./email.txt');
}();

// A poor-man's, synchronized, filename generator.
var recordFilenameGenerator = function (basePath) {
	var counter = fs.readdirSync(basePath).length;	
	return {
		next : function() {
			counter++;
			return basePath + "/" + counter + ".txt";
		}
	};
}(recordsPath); // closure


var saveData = function (data, success, failure) {
	// Save the json data to the disk.	
	var filename = recordFilenameGenerator.next();
	
	var writeFile = function (filename, data) {
		fs.writeFile(filename, data, 
		function(err) {
			if (err) {
				failure(err);
			}
			else {					
				success(filename);
			}
		});		
	};
				
	fs.exists(filename, 
	function (exists) {
		!exists ? writeFile(filename, data) : failure("Sad :(");
	});
};


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
	if (person.shirt.want) {
		options.push("maybe wanting a shirt");
	}
	if (person.volunteer.want) {
		options.push("interested in volunteering");
	}

	return combineOptionsIntoSentence(options);
};


var getOptionsDetailTxt = function (person) { 
	// Complete the sentence: "We'll follow up when we have our ___________."
	var options = [];	
	
	if (person.shirt.want) {
		options.push("shirt design ready");
	}
	if (person.housing.guest || person.housing.host) {
		options.push("housing survey prepared");
	}
	if (person.volunteer.want) {
		options.push("volunteer signup sheet good to go");
	}

	options.push("event schedule finalized");

	return combineOptionsIntoSentence(options);
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



var buildEmailMessage = function (email, person) {
	var message = rawEmailTxt;
	message = message.replace("{options}", getOptionsTxt(person));
	message = message.replace("{email}", email);
	message = message.replace("{options.detail}", getOptionsDetailTxt(person));

	return message;
};

var sendEmail = function (email, person, success, failure) {

	var message = buildEmailMessage(email, person);
 	var from    = "Corvallis Swing & Blues <glenn@corvallisswing.com>";
	var to      = person.name + "<" + email + ">";
	var cc      = "lindy@corvallisswing.com";
	var subject = "Corvallis Swing & Blues Weekend registration";

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

// Handle PUT requests.
app.put(submitTarget, function (req, res) {
	
	var person = req.body;
	var data = JSON.stringify(person);

	// Make sure we know what we're dealing with.
	var email = ""; 
	try {
		email = sanitize(person.email).trim();
		check(email).isEmail(); 
	}
	catch (e) {
		// Client checks should stop us from getting here, so just fail and
		// don't worry about giving much detail.
		console.log("Invalid email received: " + email);
		res.send(400,"We don't think the email address provided is legitimate. Sorry.");
		return;
	}

	// Various callbacks ... 
	// It's probably easiest to read this 
	// from the bottom to the top.
	var emailPass = function() {
		res.send("Thanks!");	
	};

	var emailFail = function(err) {
		console.log(err);
		res.send(500,"Sending the email didn't work. Can you please tell us it broke?");
	};

	var savePass = function() {
		// After we save, send out an email.
		sendEmail(email, person, emailPass, emailFail);
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the rsvp info didn't work. Can you please tell us it broke?");
	};

	// Save the data to the disk.
	saveData(data, savePass, saveFail);
});

// For fun, do something with GET and POST.
app.get(submitTarget, function (req, res) {
	res.send(':-)');    
});
app.post(submitTarget, function (req, res) {
	res.send("Please PUT your stuff.");	
});

// We get process.env.PORT from iisnode
app.listen(process.env.PORT);