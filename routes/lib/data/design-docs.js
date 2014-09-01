module.exports = function () {
	var designDocs = [];

	var addDoc = function (designDoc) {
		designDocs.push(designDoc);
	};

	var saveDesignDocs = function (database, callback) {

		var maybeReady = function (designDoc) {
			var areAllDocsReady = true;

			designDoc.isReady = true;
			designDocs.forEach(function (doc) {
				if (!doc.isReady) {
					areAllDocsReady = false;
				}
			});

			if (areAllDocsReady) {
				callback();
			}
		};

		var saveDoc = function (doc) {
			database.insert(doc.body, doc.url, function (err, body) {
				if (err && err['status-code'] === 409) {
					// document conflict (always happens if doc exists)
					database.get(doc.url, function (err, body) {
						if (err) {
							callback(err);
						}
						else {
							doc.body._id = body._id;
							doc.body._rev = body._rev;
							saveDoc(doc);
						}
					});
				}
				else if (err) {
					callback(err);
				}
				else {
					maybeReady(doc);
				}
			});
		};

		// Save our design doc if it doesn't exist or if
		// the version in the database is different from
		// the one we have in the code.
		designDocs.forEach(function (doc) {
			database.get(doc.url, function (err, body) {
				if (err && err['status-code'] === 404) {
					saveDoc(doc);	
				}
				else if (err) {
					callback(err);
				}
				else {
					if (body.version === doc.body.version) {
						// Up to date.
						maybeReady(doc);
					}
					else {
						saveDoc(doc);
					}
				}
			});
		});
	};

	return {
		add: addDoc,
		saveToDatabase: saveDesignDocs
	};
}();