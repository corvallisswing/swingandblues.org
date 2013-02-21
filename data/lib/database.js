//----------------------------------------------------
// database.js
//
// The thing that knows about our database implementation.
//
var cradle = require('cradle');

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

		var adminDesignDoc = {
			url: '_design/admin',
			body: 
			{
				guests: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.role = doc.dancer.role;
							p.from = doc.travel.zip;
							emit(doc.name, p);
						}
					}
				},

				payments: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							p.payment = {};
							p.payment.method = doc.payment.method;
							p.payment.status = doc.payment.status || 'new';
							p.payment.amount = doc.payment.amount || 40;
							emit(p.name, p);
						}
					}
				},

				housing: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.from = doc.travel.zip;
							p.housing = {};
							p.housing.guest = doc.housing.guest;
							if (p.housing.guest) {
								emit(p.name, p);
							}
						}
					}
				},

				hosts: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.housing = {};
							p.housing.host = doc.housing.host;
							if (p.housing.host) {
								emit(p.name, p);
							}
						}
					}
				},

				shirts: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							p.shirt = {};
							p.experience = {};
							p.shirt.want = doc.shirt.want;
							if (p.shirt.want) {
								p.shirt.style = doc.shirt.style;
								p.shirt.size = doc.shirt.size;
								p.shirt.canHaz = doc.shirt.canHaz;
								p.shirt.status = doc.shirt.status || 'new';

								var site = 'swing';
								if (doc.experience) {
									site = doc.experience.site;
								}
								p.experience.site = site;

								emit(p.name, p);
							}
						}
					}
				},				

				carpool: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.travel = {};
							p.travel.carpool = doc.travel.carpool;
							p.travel.zip = doc.travel.zip;
							if (p.travel.carpool) {
								emit(p.travel.zip, p);
							}
						}
					}
				},

				train: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.travel = {};
							p.travel.train = doc.travel.train;
							if (p.travel.train) {
								emit(p.name, p);
							}
						}
					}
				},

				volunteers: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.volunteer = {};
							p.volunteer.want = doc.volunteer.want;
							if (p.volunteer.want) {
								emit(p.name, p);
							}
						}
					}
				},

				emails: {
					map: function(doc) {
							if (doc.email) {
								emit(doc.email, 1);
							}
					},
					reduce: function (keys, values, rereduce) {
						return sum(values);
					}
				},

				blues: {
					map: function(doc) {
						if (doc.name && doc.experience) {
							var p = {};
							p.name = doc.name;
							p.email = doc.email;
							p.experience = {};
							p.experience.site = doc.experience.site;
							if (p.experience.site === "blues") {
								emit(p.name, p);
							}
						}
					}
				},

				welcome: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							// TODO: Clean up
							if (doc.experience) {
								p.experience = doc.experience;

								if (doc.experience.welcomed) {
									p.experience.welcomed = doc.experience.welcomed; 
								}
								else {
									p.experience.welcomed = false;
								}
							}	
							else {
								p.experience = {};
								p.experience.welcomed = false;
							}													 
							
							emit(p.name, p);
						}
					}
				},

				surveyed: {
					map: function(doc) {
						if (doc.name) {
							var p = {};
							p.id = doc._id;
							p.name = doc.name;
							p.email = doc.email;
							// TODO: Clean up
							if (doc.experience) {
								p.experience = doc.experience;

								if (doc.experience.surveyed) {
									p.experience.surveyed = doc.experience.surveyed; 
								}
								else {
									p.experience.surveyed = false;
								}
							}	
							else {
								p.experience = {};
								p.experience.surveyed = false;
							}													 
							
							emit(p.name, p);
						}
					}
				},

				all: {
					map: function(doc) {
						if (doc.name) {
							emit(doc.name, doc);
						}
					}
				}
			}
      	};

      	// Create or update the design doc if something we 
      	// want is missing.
      	var forceDesignDocSave = false;

		database.get(adminDesignDoc.url, function (err, doc) {
			if (err || !doc.views 
				|| !doc.views.guests
				|| !doc.views.payments
				|| !doc.views.housing
				|| !doc.views.hosts
				|| !doc.views.shirts
				|| !doc.views.carpool
				|| !doc.views.train
				|| !doc.views.volunteers
				|| !doc.views.emails
				|| !doc.views.blues
				|| !doc.views.welcome
				|| !doc.views.surveyed
				|| !doc.views.allSurveys
				|| !doc.views.all
				|| forceDesignDocSave) {
				// TODO: Add a mechanism for knowing when views
				// themselves have updated, to save again at the
				// appropriate times.
				database.save(adminDesignDoc.url, adminDesignDoc.body); 
			}
		});

		var surveyDesignDoc = {
			url: '_design/survey',
			body: {
				all: {
					map: function(doc) {
						if (doc.attendance) {
							emit(null, doc);
						}
					}
				},
			}
		};

		database.get(surveyDesignDoc.url, function (err, doc) {
			if (err || !doc.views 
				|| !doc.views.all
				|| forceDesignDocSave) {
				// TODO: Add a mechanism for knowing when views
				// themselves have updated, to save again at the
				// appropriate times.
				database.save(surveyDesignDoc.url, surveyDesignDoc.body); 
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

	var localhostUrl = "http://localhost:5984";
	var uuidUrl = localhostUrl + "/_uuids";
	var databaseUrl = localhostUrl + "/weekendrsvp";
	var designUrl   = databaseUrl + '/_design/rsvp';
	var getRolesUrl = designUrl + '/_view/roles?group=true';

	var getRoles = function (success, failure) {

		request.get(getRolesUrl, function (error, response, body) {
			if (error) {
				failure(error);
				return;
			}

			success(body);
		});
	};

	var getView = function(viewUrl, success, failure) {
		database.view(viewUrl, function (error, response) {
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

	var getGuests = function(success, failure) {
		getView('admin/guests', success, failure);
	};

	var getPayments = function(success, failure) {
		getView('admin/payments', success, failure);
	};

	var getHousing = function(success, failure) {
		getView('admin/housing', success, failure);
	};

	var getHosts = function(success, failure) {
		getView('admin/hosts', success, failure);
	};

	var getShirts = function(success, failure) {
		getView('admin/shirts', success, failure);
	};

	var getCarpool = function(success, failure) {
		getView('admin/carpool', success, failure);
	};

	var getTrain = function(success, failure) {
		getView('admin/train', success, failure);
	};

	var getVolunteers = function(success, failure) {
		getView('admin/volunteers', success, failure);
	};

	var getEmailAddressCount = function(email, success, failure) {
		getView('admin/emails', {key: email}, success, failure);
	};

	var getBlues = function(success, failure) {
		getView('admin/blues', success, failure);
	};

	var getWelcome = function(success, failure) {
		getView('admin/welcome', success, failure);
	};

	var getSurveyed = function(success, failure) {
		getView('admin/surveyed', success, failure);
	};

	var getAllSurveys = function(success, failure) {
		getView('survey/all', success, failure);
	};

	var getAll = function(success, failure) {
		getView('admin/all', success, failure);
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

	var _setPaymentAmount = function(amount, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;
			doc.payment.amount = amount;
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

	var _setShirtStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				return;
			}

			var rev = doc._rev;
			doc.shirt.status = status;
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

	var _setWelcomeStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				console.log(err);
				return;
			}

			var rev = doc._rev;
			if (!doc.experience) {
				doc.experience = {};
			}
			doc.experience.welcomed = status;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				console.log(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	var _setSurveyedStatus = function(status, guestId, editEmail, success, failure) {
		database.get(guestId, function (err, doc) {
			if (err) {
				failure(err);
				console.log(err);
				return;
			}

			var rev = doc._rev;
			if (!doc.experience) {
				doc.experience = {};
			}
			doc.experience.surveyed = status;
			doc.editedBy = editEmail;

			database.save(doc._id, rev, doc, function (err, res) {
      			if (err) {
      				failure(err);
      				console.log(err);
      				return;
      			}
      			success(res);
			});
  		});
	};

	return {
		roles : getRoles,
		guests : getGuests,
		payments : getPayments,
		housing : getHousing,
		hosts : getHosts,
		shirts : getShirts,
		train : getTrain,
		carpool : getCarpool,
		volunteers : getVolunteers,
		emailAddressCount : getEmailAddressCount,
		blues : getBlues,
		welcome : getWelcome,
		surveyed : getSurveyed,
		setPaymentStatus : _setPaymentStatus,
		setPaymentAmount : _setPaymentAmount,		
		setShirtStatus : _setShirtStatus,
		setWelcomeStatus : _setWelcomeStatus,
		setSurveyedStatus : _setSurveyedStatus,
		all : getAll,
		survey : {
			all : getAllSurveys
		}
	};
}(); // closure

exports.db = db;