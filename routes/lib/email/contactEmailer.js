//------------------------------------------------------------
// contactEmailer.js
//
// ... you know, for emailing.

var nodemailer = require('nodemailer');
var settings = require('../settings');

var transporter; 

var sendEmail = function (envelope, callback) {
    var fromName = "Weekend Contact Form"

    var message = envelope.text;
    var from    = fromName + " <glenn@corvallisswing.com>";
    var replyTo = envelope.from || "";
    var to      = "Weekend Planners <lindy+weekend-contact@corvallisswing.com>";
    var subject = envelope.subject || "(no subject)";

    var mail = {
        text:    message, 
        from:    from, 
        replyTo: replyTo,
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