'use strict';

function ThanksCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.thanks);

    $scope.isRole = function (role) {
        return role === session.person.role;
    };
}
ThanksCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];