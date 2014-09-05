'use strict';

function HostingCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.hosting);

    $scope.hosting = session.hosting;

    $scope.next = function () {
        session.hosting = $scope.hosting;
        session.save();

        $http.put('/rsvp/data/hosting', session.hosting)
        .success(function () {
            rsvpFlow.next(session);
        });
    };
}
HostingCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];