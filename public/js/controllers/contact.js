'use strict';

function ContactCtrl($scope, $http) {
    var isSending = false;

    $scope.sendEmail = function () {
        if (isSending) {
            // Do nothing.
            return;
        }
        isSending = true;

        var envelope = {};
        envelope.subject = $scope.subject || "(no subject)";
        envelope.from = $scope.fromAddress;
        envelope.text = $scope.text;

        $scope.emailStatus = "Sending ..."

        $http.post("/contact", envelope)
        .success(function (data, status) {
            $scope.emailStatus = "Email sent. Thanks!"
            isSending = false;
        })
        .error(function (data, status) {
            $scope.emailStatus = "Sorry, our emails aren't working today. :-( Please try again, later?";
            isSending = false;
        });
    };
}
ContactCtrl.$inject = ['$scope', '$http'];