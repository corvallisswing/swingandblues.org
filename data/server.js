//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012

var express = require('express');
var request = require('request');
var cradle  = require('cradle');

var app = express();
app.use(express.bodyParser());

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

	//var couch = couchdb.srv(localhostUrl).db("weekendrsvp");

	// Create database.
	// request.get(databaseUrl, function (error, response, body) {
	// 	if (error) {
	// 		console.log("Error creating database. Do you have CouchDB installed?");
	// 		return;
	// 	}
	// });

	// 	// TODO: Don't assume that the database was created
	// 	// successfully.

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

	return {
		roles : getRoles
	};
}(); // closure

app.get('/data/', function (req, res) {
	res.send(':-)');    
});

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


app.get('/data/roles/', function (req, res) {

	var success = function(result) {
		res.send(result);
	};

	var failure = function(error) {
		res.send(500, ':-(');
	};

	roles(success, failure);
});

var getAttendanceLimit = function() {
	return 150;
};

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

// We get process.env.PORT from iisnode
var port = process.env.PORT || 3000;
app.listen(port);