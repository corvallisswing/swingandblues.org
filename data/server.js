//------------------------------------------------------------
// The data API for Corvallis Swing & Blues Weekend.
//
// Author: Phil
// Created: September 2012

var express  = require('express');
var request  = require('request');

var app = express();
app.use(express.bodyParser());

var db = function() {
	var localhostUrl = "http://localhost:5984";
	var databaseUrl = localhostUrl + "/weekendrsvp";
	var getRolesUrl = databaseUrl + '/_design/rsvp/_view/roles?group=true';

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
app.listen(process.env.PORT);