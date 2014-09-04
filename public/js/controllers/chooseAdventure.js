'use strict';

function ChooseAdventureCtrl(rsvp, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens['choose-your-adventure']);

    $scope.next = function () {
        rsvpFlow.next();
    };
}
ChooseAdventureCtrl.$inject = ['rsvp','$scope', '$http', 'rsvpFlow'];