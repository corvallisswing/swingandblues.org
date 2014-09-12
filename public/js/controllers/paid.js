'use strict';

function PaidCtrl(session, $scope, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.paid);
    
    // We're done!
    //
    // Payment and RSVP was saved on the server.

    // TODO: Put in RsvpCtrl
    $scope.isRole = function (role) {
        return role === session.person.role;
    };
}
PaidCtrl.$inject = ['session','$scope', 'rsvpFlow'];