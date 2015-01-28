'use strict'

function AdminSurvey(rsvps, $scope, $http) {

    $scope.welcomeStatus = {};
    rsvps.forEach(function (rsvp) {
        $scope.welcomeStatus[rsvp._id] = rsvp.meta.surveySent ? ':-)' : '';
    });

    $scope.isEmailing = {};

    var sendWelcomeEmail = function(rsvp, callback) {
        var guestEmail = rsvp.person.email;

        if ($scope.isEmailing[guestEmail]) {
            // Do nothing.
            console.log("Already emailing " + guestEmail + ". Wait.");
            return;
        }

        $scope.isEmailing[guestEmail] = true;
        $scope.welcomeStatus[rsvp._id] = "...";

        $http.put("/admin/data/email/survey", rsvp)
        .success(function() {
            $scope.isEmailing[guestEmail] = false;
            if (callback) {
                callback(); 
            }            
        })
        .error(function (data, status, headers, config) {         
            $scope.isEmailing[guestEmail] = false;
            if (callback) {
                callback(data);
            }
        });
    };

    $scope.sendEmail = function (id) {
        var rsvp = undefined;
        for (var i=0; i < rsvps.length; i++) {
            if (rsvps[i]._id === id) {
                rsvp = rsvps[i];
                break;
            }
        }

        // Send email
        sendWelcomeEmail(rsvp, function (err) {
            if (err) {
                $scope.welcomeStatus[rsvp._id] = 'failed';
                console.log(err);
                return;
            }
            $scope.welcomeStatus[rsvp._id] = ':-)';
        });
    };
}
AdminSurvey.$inject = ['rsvps', '$scope', '$http'];
