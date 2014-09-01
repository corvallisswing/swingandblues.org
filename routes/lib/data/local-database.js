var nano = require('nano');

module.exports = function (databaseName, designDocs) {

	var databaseUrl = 'http://localhost:5984';

	// Connect to Couch! 
	var database, nanoMaster;
	var databaseOptions = {};
	databaseOptions.url = databaseUrl;
	var nanoMaster = nano(databaseOptions);
	var database = nanoMaster.use(databaseName);
	var isDatabaseReady = false;

	var databaseExists = function (callback) {
		var opts = {
			db: databaseName,
			method: "GET"
		};

		nanoMaster.relax(opts, function (err, body) {
			if (err && err['status-code'] === 404) {
				callback(null, false);
			}
			else if (err) {
				callback(err);
			}
			else {
				callback(null, true);
			}
		});
	};

	var createDatabase = function (callback) {
		var opts = {
			db: databaseName,
			method: "PUT"
		};

		nanoMaster.relax(opts, callback);
	};

	var createDatabaseAndViews = function(callback) {
		// Create database!
		databaseExists(function (err, exists) {
			if (err) {
				throw (err);
			}
			else if (exists) {
				designDocs.create(database, callback);
			}
			else {
				createDatabase(function (err) {
					if (err) {
						console.log(err);
						callback(err);
					}
					else {
						designDocs.create(database, callback);
					}
				});
			}
		});
	};

	var whenDatabaseReady = function (callback, timeout) {
		var timeSpent = 0;
		var intervalId = setInterval(function () {
			if (isDatabaseReady) {
				clearInterval(intervalId);
				callback();
			}

			if (timeout && timeSpent > timeout) {
				clearInterval(intervalId);
				callback("Reached timeout before database was ready.")
			}

			timeSpent += 100;
		}, 100);
	};

	var compact = function () {
		nanoMaster.db.compact(databaseName);
	};

	// TODO: Note, this causes the database to be
	// created immediately, which we might not want
	// to necessarily do.
	createDatabaseAndViews(function (err) {
		if (err) {
			console.log(err);
		}
		else {
			// database ready.
			isDatabaseReady = true;
		}
	});

	database.whenReady = whenDatabaseReady;
	database.compact = compact;

	return database;
};