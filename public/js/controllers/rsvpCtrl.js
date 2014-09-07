'use strict'

function RsvpCtrl(session, $scope, rsvpFlow) {
    
    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };

    $scope.startOver = function () {
        session.expire();
        rsvpFlow.startOver();
    };
}
RsvpCtrl.$inject = ['session', '$scope', 'rsvpFlow'];
