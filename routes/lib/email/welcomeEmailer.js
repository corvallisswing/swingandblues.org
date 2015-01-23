//------------------------------------------------------------
// welcomeEmailer.js
//
// ... you know, for emailing.

var nodemailer = require('nodemailer');
var settings = require('../settings');

var path = require('path');
var fs = require('fs');

var transporter; 

var rawEmail = function() {
    var message = fs.readFileSync(path.join(__dirname, 'welcomeEmail.txt'), 'utf8');
    return {
        txt : message
    }; 
}();

var getEventNameTxt = function () {
    return "Corvallis Swing & Blues Weekend";
};

var getEventUrl = function () {
    return "https://swingandblues.org";
};

var buildEmailMessage = function (rsvp) {
    var message = rawEmail.txt;

    message = message.replace(/{eventName}/g, getEventNameTxt(rsvp));
    message = message.replace(/{eventUrl}/g, getEventUrl(rsvp));

    return message;
};

var sendEmail = function (rsvp, callback) {
    var message = buildEmailMessage(rsvp);
    var from    = "Corvallis Swing & Blues <glenn@corvallisswing.com>";
    var to      = "Guest <" + rsvp.person.email + ">";
    var subject = "welcome to Swing & Blues Weekend 2015";

    var mail = {
        text:    message, 
        from:    from, 
        to:      to,
        subject: subject
    };

    var initTransporter = function (callback) { 
        settings.getAll(function (err, settings) {
            if (err) {
                return callback(err);
            }

            var canProceed = (settings['smtp-service'] &&
                settings['smtp-login'] &&
                settings['smtp-password']);

            if (!canProceed) {
                var msg = "Server does not have email configured.";
                var err = new Error(msg);
                return callback(err);
            }

            var service = settings['smtp-service'].value;
            var login = settings['smtp-login'].value;
            var password = settings['smtp-password'].value;

            transporter = nodemailer.createTransport({
                service: service,
                auth: {
                    user: login,
                    pass: password
                }
            });

            callback();
        });
    }

    if (transporter) {
        transporter.sendMail(mail, callback);
    }
    else {
        initTransporter(function (err) {
            if (err) {
                return callback(err);
            }
            transporter.sendMail(mail, callback);
        });
    }
};

exports.sendEmail = sendEmail;