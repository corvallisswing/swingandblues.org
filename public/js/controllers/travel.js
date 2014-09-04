'use strict';

function TravelCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.travel);

    $scope.travel = session.travel;
    $scope.housing = session.housing;

    $scope.next = function () {
        session.travel = $scope.travel;
        session.housing = $scope.housing;
        session.save();

        $http.put('/rsvp/data/travel', session)
        .success(function () {
            rsvpFlow.next(session);
        });
    };
}
TravelCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];