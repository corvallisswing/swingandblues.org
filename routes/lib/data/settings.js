var couch = {};
couch.settings = require('./settings-couch.js');

module.exports = function () {
	
	var addSetting = function(setting, callback) {
		var newSetting = {
			name: setting.name,
			value: setting.value,
			visibility: setting.visibility || "private",
			kind: setting.kind || ""
		};
		
		couch.settings.add(newSetting, callback);
	};

	var getSettingsView = function (name, callback) {
		return couch.settings.getView(name, callback);
	}

	var getSettings = function (callback) {
		getSettingsView("public", function (err, settings) {
			if (err) {
				return callback(err);
			}

			// Append public settings computed from private settings.
			getAuthorizedSettings(function (err, privateSettings) {
				if (err) {
					// Ignore
					return callback(null, settings);
				}
				var smtpEnabledSetting = {
					type: "setting",
					name: "smtp-enabled",
					visibility: "public"
				};

				if (privateSettings['smtp-login'] 
					&& privateSettings['smtp-login'].value) {
					smtpEnabledSetting.value = true;
				}
				else {
					smtpEnabledSetting.value = false;
				}

				settings['smtp-enabled'] = smtpEnabledSetting;
				callback(null, settings);
			});
		});
	};

	var getAuthorizedSettings = function (callback) {
		getSettingsView("authorized", callback);
	};

	var getPrivateSettings = function (callback) {
		getSettingsView("private", callback);
	};

	var getAllSettings = function (callback) {
		getSettingsView("all", callback);
	};

	return {
		add: addSetting,
		get: getSettings,
		getAuthorized: getAuthorizedSettings,
		getPrivate: getPrivateSettings,
		getAll: getAllSettings,
		update: couch.settings.update
	};
}(); // closure