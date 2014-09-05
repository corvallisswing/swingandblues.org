'use strict';

function ChooseAdventureCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens['choose-your-adventure']);

    $scope.shirt = session.shirt;
    $scope.volunteer = session.volunteer;
    $scope.hosting = session.hosting;
    $scope.housing = session.housing;

    $scope.next = function () {
        session.shirt = $scope.shirt,
        session.volunteer = $scope.volunteer,
        session.hosting = $scope.hosting,
        session.housing = $scope.housing,
        session.save();        

        $http.put('/rsvp/data/adventure', session)
        .success(function () {
            rsvpFlow.next(session);    
        });
    };

    // Only allow one of housing or hosting
    $scope.$watch('housing.want', function (val) {
        if (val) {
            $scope.hosting = {};
        }
    });

    $scope.$watch('hostng.want', function (val) {
        if (val) {
            $scope.housing = {};
        }
    });
}
ChooseAdventureCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];