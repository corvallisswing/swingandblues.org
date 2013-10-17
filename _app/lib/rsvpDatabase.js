//------------------------------------------------------------
// database.js
//

var cradle  = require('cradle');
var request  = require('request'); // TODO: Migrate to cradle

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
				},

				findById: {
					map: function (doc) {
						if (doc.email && doc._id) {
							emit(doc._id, doc);
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
				|| !doc.views.findById
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

	var _findGuestById = function (id, success, failure) {
		getView('rsvp/findById', {key: id}, success, failure);
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
		findGuest: _findGuest,
		findGuestById: _findGuestById,
		setShirtData: _setShirtData,
		setPaymentStatus: _setPaymentStatus,
		all: getAll
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

exports.db = db;
exports.oldDb = oldDb;