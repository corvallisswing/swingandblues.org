//------------------------------------------------------------
// Process RSVP submissions to an event. Basically, we 
// save the registration to disk and send an email.
//
// Author: Phil
// Created: September 2012

var express  = require('express');
var fs       = require('fs');
var check    = require('validator').check;
var sanitize = require('validator').sanitize;
var request  = require('request');

var cradle  = require('cradle');
var secrets = require('./lib/secrets.js');
var emailer = require('./lib/emailer.js');

var app = express();
app.use(express.bodyParser());

var submitTarget = '/rsvp/submit/';
var recordsPath = './records';



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
		var rsvpDesignDoc = {
			url: '_design/rsvp',
			body: 
			{
				roles: {
					map: function(doc) {
							if (doc.dancer && doc.dancer.role) {
								emit(doc.dancer.role, 1);
							}
					},
					reduce: function (keys, values, rereduce) {
						return sum(values);
					}
				},

				find: {
					map: function(doc) {
						if (doc.email) {
							emit(doc.email, doc);
						}
					}
				}
			}
      	};

      	// Create or update the design doc if something we 
      	// want is missing.
      	var forceDesignDocSave = true;

		database.get(rsvpDesignDoc.url, function (err, doc) {
			if (err || !doc.views 
				|| !doc.views.roles
				|| !doc.views.find
				|| forceDesignDocSave) {
				// TODO: Add a mechanism for knowing when views
				// themselves have updated, to save again at the
				// appropriate times.
				database.save(rsvpDesignDoc.url, rsvpDesignDoc.body); 
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

	var getView = function(viewUrl, keys, success, failure) {
		database.view(viewUrl, keys, function (error, response) {
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

	var _findGuest = function(email, success, failure) {
		getView('rsvp/find', {key: email}, success, failure);
	};

	var getAll = function(success, failure) {
		getView('admin/all', success, failure);
	};

	var _setShirtData = function(shirtData, guestId, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;

			doc.shirt.canHaz = shirtData.canHaz;
			doc.shirt.style = shirtData.style;
			doc.shirt.size = shirtData.size;
			doc.shirt.want = shirtData.want;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				return;
      			}
      			success(res);
			});
  		});
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

	return {
		findGuest : _findGuest,
		setShirtData : _setShirtData,
		setPaymentStatus : _setPaymentStatus,
		all : getAll
	};
}(); // closure

// TODO: Merge this functionality into the new db object that uses cradle.
var oldDb = function() {
	var isReady = false;
	var localhostUrl = "http://localhost:5984";
	var uuidUrl = localhostUrl + "/_uuids";
	var databaseUrl = localhostUrl + "/weekendrsvp";

	// Create database.
	request.put(databaseUrl, function (error, response, body) {
		if (error) {
			console.log("Error creating database. Do you have CouchDB installed?");
			return;
		}
		isReady = true;
	});

	var addRecord = function (data, success, failure) {
		if (!isReady) {
			failure("Database is not yet ready (or not installed).");
		}

		// Get a UUID from CouchDB ...
		request.get(uuidUrl, function (error, repsonse, body) {
			if (error) {
				failure(error);
				return;
			}

			var uuid = JSON.parse(body).uuids[0];
			// Put the document into the database.
			request.put({
				uri : databaseUrl + '/' + uuid,
				json : data
			}, 
			function (error, response, body) {
				if (error) {
					// Failure to communicate.
					failure(error);
				}
				else {
					if (body.ok) {
						// Saved to database
						success(body);
					}
					else {
						// Problem saving
						failure(body);
					}					
				}
			});
		});
	};

	return {
		add : addRecord
	};
}(); // closure


// A poor-man's, synchronized, filename generator.
var recordFilenameGenerator = function (basePath) {
	// This will break if you delete any records from
	// the folder ... good thing it's just an emergency
	// backup.
	var counter = fs.readdirSync(basePath).length;	
	return {
		next : function() {
			counter++;
			return basePath + "/" + counter + ".txt";
		}
	};
}(recordsPath); // closure


var saveData = function (data, success, failure) {
	// Save to our database.
	console.log(JSON.stringify(data)); // Useful when things go wrong.

	oldDb.add(data, success, 
		function(error) {
		// In the event of database failure,
		// attempt to save the json data to disk.	
		console.log("Failed to save to database: " + error);

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
			!exists ? writeFile(filename, JSON.stringify(data)) : failure("Sad :(");
		});
	});
};

var saveSurvey = function (survey, success, failure) {
	// Save to our database.
	console.log(JSON.stringify(survey)); // Useful when things go wrong.
	oldDb.add(survey, success, failure);
};


// Handle PUT requests.
app.put(submitTarget, function (req, res) {
	
	var person = req.body;

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

	var savePass = function(info) {
		// After we save, send out an email.
		// If we're running locally, don't.
		if (req.host === "localhost") {
			console.log(info);
			res.send(":-)");
		}
		else {
			emailer.sendEmail(email, person, emailPass, emailFail);
		}
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the rsvp info didn't work. Can you please tell us it broke?");
	};

	person.payment.amount = 50;

	// Save the data to the disk.
	saveData(person, savePass, saveFail);
});

// For fun, do something with GET and POST.
app.get(submitTarget, function (req, res) {
	res.send(':-)');    
});
app.post(submitTarget, function (req, res) {
	res.send("Please PUT your stuff.");	
});

app.get('/rsvp/submit/shirt/', function (req, res) {
	res.send('yay, shirts. :-)');
});

app.put('/rsvp/submit/shirt/', function (req, res) {
	var person = req.body;

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

	var emailFound = function(docs) {
		if (docs.length && docs.length === 1) {
			var databasePerson = docs[0];
			databasePerson.shirt.canHaz = person.shirt.canHaz;
			databasePerson.shirt.style = person.shirt.style;
			databasePerson.shirt.size = person.shirt.size;
			databasePerson.shirt.want = true;

			db.setShirtData(databasePerson.shirt, databasePerson._id, 
				function() {
					// Success
					res.send(200,"Ok!");
				},
				function(err) {
					// Failure
					console.log(err);
					res.send(501, "Failure.");
				}
			);
	  	}
		else {
			res.send(400, "Too many emails.");
		}
	};

	var emailNotFound = function() {
		res.send(400, "Not found. Boo.");
	};

	db.findGuest(email, emailFound, emailNotFound);
});


app.put('/rsvp/submit/shirt/query', function (req, res) {
	var person = req.body;

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

	var emailFound = function(docs) {
		if (docs.length && docs.length === 1) {
			var databasePerson = docs[0];
			if (databasePerson.shirt.canHaz) {
				res.send(databasePerson.shirt);	
			}
	  	}
		else {
			res.send(400, "Too many emails.");
		}
	};

	var emailNotFound = function() {
		res.send(400, "Not found. Boo.");
	};

	db.findGuest(email, emailFound, emailNotFound);
});

app.get('/rsvp/submit/survey/', function (req, res) {
	res.send('yay, surveys. :-) :-)');
});

app.put('/rsvp/submit/survey/', function (req, res) {

	var survey = req.body;

	var savePass = function(info) {
		// If we're running locally, log stuff.
		if (req.host === "localhost") {
			console.log(info);
			res.send(":-)");
		}
		else {
			res.send("Thank you. :-)");
		}
	};

	var saveFail = function(err) {		
		console.log(err);
		res.send(500,"Saving the survey didn't work. Can you please tell us it broke?");
	};

	saveSurvey(survey, savePass, saveFail);
});


// We get process.env.PORT from iisnode
var port = process.env.PORT || 3001;
app.listen(port);