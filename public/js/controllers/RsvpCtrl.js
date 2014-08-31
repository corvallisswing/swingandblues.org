'use strict';

function RsvpCtrl($scope, $http, $location, $window) {
 
    $scope.next = function () {
        var data = {
            name: "Test Name"
        };

        $http.put('/rsvp/data', data)
        .success(function (data, status) {
            $window.location.href = '/rsvp/next';
        })
        .error(function (data, status) {
            // TODO: Logging ...
        });

        console.log("RSVP");
    };
}
RsvpCtrl.$inject = ['$scope', '$http', '$location', '$window'];
