'use strict';

function FoodCtrl(rsvp, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.food);

    $scope.toggleAllergy = function (name) {
        if (!$scope.allergies[name]) {
            $scope.allergies[name] = true;
        }
        else {
            $scope.allergies[name] = false;
        }
    };

    $scope.next = function () {
        rsvpFlow.next();
    };
}
FoodCtrl.$inject = ['rsvp','$scope', '$http', 'rsvpFlow'];