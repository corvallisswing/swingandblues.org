// views.js
//
// The design docs specific to our project.
var designDocs = require("./design-docs.js");

var rsvpDesignDoc = {
    url: '_design/rsvp',
    body: 
    {
        version: "1.0.1",
        language: "javascript",
        views: {
            'byEmail': {
                map: function (doc) {
                    if (doc.type === "rsvp" && doc.person) {
                        emit(doc.person.email, doc);
                    }
                }
            },
            'byName': {
                map: function (doc) {
                    if (doc.type === "rsvp" && doc.person) {
                        emit(doc.person.name, doc);
                    }
                }
            }
        }
    }
};
designDocs.add(rsvpDesignDoc);

var settingsDesignDoc = {
    url: '_design/settings',
    body: 
    {
        version: "1.0.0",
        language: "javascript",
        views: {
            'authorized': {
                map: function (doc) {
                    if (doc.type === "setting") {
                        if (doc.visibility === "public" 
                         || doc.visibility === "private") {
                            emit(doc.name, doc);
                        }
                        else if (doc.visibility === "secret") {
                            var setting = {};
                            for (var prop in doc) {
                                setting[prop] = doc[prop];
                            }
                            // Do not expose the value of secret settings
                            setting.value = undefined;
                            emit(doc.name, setting);
                        }
                    }
                }
            },
            'public': {
                map: function (doc) {
                    if (doc.type === "setting") {
                        if (doc.visibility === "public") {
                            emit(doc.name, doc);    
                        }
                    }
                }
            },
            'private': {
                map: function (doc) {
                    if (doc.type === "setting") {
                        if (doc.visibility === "private") {
                            emit(doc.name, doc);
                        }
                    }
                }
            },
            'all': {
                map: function (doc) {
                    if (doc.type === "setting") {
                        emit(doc.name, doc);    
                    }
                }
            }
        }
    }
};
designDocs.add(settingsDesignDoc);

var createDesignDocs = function (database, callback) {
	designDocs.saveToDatabase(database, callback);
};

exports.create = createDesignDocs;