'use strict'

function AdminPayment(rsvps, $scope, $http) {

    var details = [];

    $scope.paymentStatus = {};
    rsvps.forEach(function (rsvp) {
        $scope.paymentStatus[rsvp._id] = rsvp.payment.status || 'new';
    });


    $scope.setPaymentStatus = function (status, id) {
        $scope.paymentStatus[id] = status;
        var body = {
            id: id,
            status: status
        };
        $http.put('/admin/data/payment/status', body)
        .error(function (data, status) {
            console.log(data);
            console.log(status);
            $scope.paymentStatus[id] = "error";
        });
    };

    $scope.getPanelClass = function (id) {
        var val = {};
        val[$scope.paymentStatus[id]] = true;
        return val;
    };
}
AdminPayment.$inject = ['rsvps', '$scope', '$http'];
