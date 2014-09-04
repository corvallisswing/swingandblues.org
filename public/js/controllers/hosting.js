'use strict';

function HostingCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.hosting);

    $scope.hosting = session.hosting;

    $scope.next = function () {
        session.hosting = $scope.hosting;
        session.save();

        $http.put('/rsvp/data/hosting', session)
        .success(function () {
            rsvpFlow.next(session);
        });
    };
}
HostingCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];