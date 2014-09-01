var mailer = require('nodemailer');
var settings = require('./settings.js');

// params: sender, recipients, message, subjectPrefix
var sendEmail = function (params, callback) {
	var sender = params.sender; // { name, email }
	var recipients = params.recipients; // { name, email }
	var message = params.message;
	var subjectPrefix = params.subjectPrefix || "";

	settings.getAll(function (err, settings) {
		if (err) {
			return callback({
				status: 501,
				message: "Notifcation failed",
				error: err
			});
		}

		var smtpService = settings['smtp-service'];
		var smtpUsername = settings['smtp-login'];
		var smtpPassword = settings['smtp-password'];

		if (!smtpUsername || !smtpPassword || !smtpService) {
			return callback({
				status: 501,
				message: "The server needs SMTP login info before sending notifications. Check the admin page."
			});
		}

		smtpService = smtpService.value;
		smtpUsername = smtpUsername.value;
		smtpPassword = smtpPassword.value;

		var smtp = mailer.createTransport("SMTP", {
			service: smtpService,
			auth: {
				user: smtpUsername,
				pass: smtpPassword
			}
		});

		var toList = function () {
			var result = "";
			recipients.forEach(function (addressee) {
				result += addressee.name + " <" + addressee.email + ">,"
			});
			result = result.slice(0,-1); // remove last comma
			return result;
		}(); // closure;

		var opt = {
			// TODO: via app name
			from: sender.name + " <" + smtpUsername + ">",
			to: toList,
			replyTo: sender.name + " <" + sender.email + ">",
			subject: subjectPrefix + story.summary,
			text: message
		};

		// For testing:
		// console.log(opt);
		// callback(null, {ok: true});

		smtp.sendMail(opt, function (err, response) {
			smtp.close();
			if (err) {
				callback(err);
			}
			else {
				callback(null, response);
			}
		});
	});
};



module.exports = function () {
	return {
		// TODO ...
	};
}(); // closure