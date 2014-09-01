var couch = require('./couch.js');
var database = couch.db;

module.exports = function () {

	var getSettingsView = function (viewName, callback) {
		// TODO: If there are two settings with the same name,
		// things might not behave well.
		var options = {
			returnKeys: true
		};
		couch.view("settings/" + viewName, options, callback);
	};

	var addSetting = function(setting, callback) {
		setting.type = "setting";
		database.insert(setting, callback);
	};

	var updateSetting = function (setting, callback) {
		console.log("Updating ...");
		console.log(setting);
		database.get(setting._id, function (err, settingToUpdate) {

			if (settingToUpdate.type !== "setting") {
				console.log(settingToUpdate);
				return callback({
					message: "Attempt to update a non-setting."
				});
			}

			var doc = {};
			doc._id = settingToUpdate._id;
			doc._rev = settingToUpdate._rev;
			doc.type = settingToUpdate.type;
			doc.name = settingToUpdate.name;

			doc.value = setting.value;
			doc.visibility = setting.visibility || settingToUpdate.visibility;

			database.insert(doc, function (err, body) {
				if (err) {
					callback(err);
				}
				else {
					doc._id = body._id;
					doc._rev = body._rev;
					callback(null, doc);
				}
			});
		});
	};

	return {
		add: addSetting,
		getView: getSettingsView,
		update: updateSetting
	};
}(); // closure