'use strict';

function ChooseAdventureCtrl(rsvp, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens['choose-your-adventure']);

    $scope.shirt = rsvp.shirt;
    $scope.volunteer = rsvp.volunteer;
    $scope.hosting = rsvp.hosting;
    $scope.housing = rsvp.housing;

    $scope.next = function () {
        var data = {
            shirt: $scope.shirt,
            volunteer: $scope.volunteer,
            hosting: $scope.hosting,
            housing: $scope.housing,
        };
            
        $http.put('/rsvp/data/adventure', data)
        .success(function (data, status) {
            rsvpFlow.next();    
        });
    };
}
ChooseAdventureCtrl.$inject = ['rsvp','$scope', '$http', 'rsvpFlow'];