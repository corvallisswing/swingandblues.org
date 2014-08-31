// views.js
//
// The design docs specific to our project.
var designDocs = require("./design-docs.js");

// var usersDesignDoc = {
// 	url: '_design/users',
// 	body: 
// 	{
// 		version: "1.0.5",
// 		language: "javascript",
// 		views: {
// 			byEmail: {
// 			}
// 		}
// 	}
// }
// designDocs.add()

var createDesignDocs = function (database, callback) {
	designDocs.saveToDatabase(database, callback);
};

exports.create = createDesignDocs;