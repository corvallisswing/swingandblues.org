var LocalDatabase = require('./local-database.js');
var designDocs    = require('./design-docs-couch.js');

var couch = function() {
	var databaseName = process.env.DATABASE_NAME || 'weekend-2015';
	var database = LocalDatabase(databaseName, designDocs);

	// getView(viewUrl, [options], callback)
	var getView = function(viewUrl, viewGenerationOptions, callback) {
		var splitViewUrl = viewUrl.split('/');
		var designName = splitViewUrl[0];
		var viewName = splitViewUrl[1];

		if (typeof viewGenerationOptions === "function") {
			callback = viewGenerationOptions;
			viewGenerationOptions = {};
		}

		database.view(designName, viewName, viewGenerationOptions, function (err, body, headers) {
			if (err) {
				callback(err);
				return;
			}
			
			if (viewGenerationOptions.returnKeys) {
				var docs = {};
				body.rows.forEach(function (doc) {
					docs[doc.key] = doc.value;
				});
			}
			else {
				var docs = [];
				body.rows.forEach(function (doc) {
					docs.push(doc.value);
				});	
			}
			
			callback(null, docs);
		});
	};

	var getDoc = function (docId, callback) {
		database.get(docId, callback);
	};

	var getDocs = function (docIds, callback) {
		if (!docIds || docIds.length < 1) {
			return callback(null, null);
		}

		var docsFound = [];
		var query = {};
		query["keys"] = docIds;
		database.fetch(query, function (err, body) {
			if (err) {
				return callback(err);
			}
			else {
				for (var rowIndex in body.rows) {
					docsFound.push(body.rows[rowIndex].doc);
				}
				return callback(null, docsFound);
			}
		});
	};

	var updateDoc = function (doc, callback) {
		database.get(doc._id, function (err, body) {
			if (err) {
				return callback(err);
			}
			doc._rev = body._rev;

			database.insert(doc, function (err, body) {
				if (err) {
					return callback(err);
				}
				doc._rev = body.rev;
				callback(null, doc);
			});
		});
	};

	var findOneByKey = function(viewName, key, callback) {
		var options = {
			limit: 1,
			key: key
		};
		getView(viewName, options, function (err, rows) {
			var doc = null;
			if (err) {
				callback(err);
			}
			else if (rows && rows.length > 0) {
				doc = rows[0];
			}
			callback(null, doc);
		});		
	}

	return {
		findOneByKey: findOneByKey,
		view: getView,
		db: database,
		fetch: getDocs,
		database: {
			whenReady: database.whenReady
		},
		docs: {
			get: getDoc,
			update: updateDoc
		}
	}
}();

module.exports = function () {
	return couch;
}(); // closure