'use strict';

function PaidCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.paid);

    var submitReservation = function() {
        if (session.isSubmitting || session.meta.submitted) {
            // Do nothing
            return; 
        }
        
        session.payment.method = "paypal";
        session.isSubmitting = true;
        session.save();    

        rsvpFlow.submit(session, function () {
            session.isSubmitting = false;
            session.meta.submitted = true;
            session.save();                
        });
    };

    submitReservation();

    // TODO: Put in RsvpCtrl
    $scope.isRole = function (role) {
        return role === session.person.role;
    };
}
PaidCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];