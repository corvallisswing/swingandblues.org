// design-docs-session.js
//
// The design docs for sessions.
//
var designDocs = require("./design-docs.js");

var sessionsDesignDoc = {
	url: '_design/sessions',
	body: 
	{
		version: "1.0.2",
		language: "javascript",
		views: {
			byExpires: {
				map: function (doc) {
					if (doc.session 
						&& doc.session.cookie 
						&& doc.session.cookie.expires) {
						emit(doc.session.cookie.expires, doc._rev);
					}
				}
			}
		}
	}
};
designDocs.add(sessionsDesignDoc);

var createViews = function (database, callback) {
	designDocs.saveToDatabase(database, callback);
};

exports.create = createViews;