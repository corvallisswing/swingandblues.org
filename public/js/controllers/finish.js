'use strict';

function FinishCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.finish);

    $scope.finish = function () {
        session.save();

        $http.put('/rsvp/data', session)
        .success(function () {
            rsvpFlow.next(session);
        });
    };
}
FinishCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];