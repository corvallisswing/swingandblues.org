'use strict';

function FinishCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.finish);

    $scope.payment = session.payment;
    $scope.isSubmitting = false;

    $scope.finish = function () {
        if ($scope.isSubmitting) {
            // do nothing
            return;
        }
        $scope.isSubmitting = true;

        session.payment = $scope.payment;
        session.save();

        $http.put('/rsvp/data/payment', session.payment)
        .success(function () {
            $http.post('/rsvp/data/submit')
            .success(function () {
                $scope.isSubmitting = false;
                rsvpFlow.next(session);    
            });
        });
    };

    $scope.setPayment = function (method) {
        $scope.payment.method = method;
    };

    $scope.isPayment = function (method) {
        return ($scope.payment.method === method);
    };
}
FinishCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];