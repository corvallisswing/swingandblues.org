'use strict';

function ShirtCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.shirt);

    $scope.shirt = session.shirt;

    $scope.next = function () {
        session.shirt = $scope.shirt;
        session.save();

        $http.put('/rsvp/data/shirt', session.shirt)
        .success(function () {
            rsvpFlow.next(session);
        });
    };

    $scope.setBuyingShirt = function (val) {
        if (val) {
            $scope.shirt.isBuying = true;
        }
        else {
            $scope.shirt.isBuying = false;
            $scope.shirt.want = false;
        }
    };

    $scope.isBuyingShirt = function (val) {
        return val === $scope.shirt.isBuying;
    };

    $scope.setShirtType = function (val) {
        $scope.shirt.type = val;
    };
    $scope.isShirtType = function (val) {
        return $scope.shirt.type === val;
    };

    $scope.setShirtSize = function (val) {
        $scope.shirt.size = val;
    };
    $scope.isSizeSelected = function (size) {
        return $scope.shirt.size === size;
    };

}
ShirtCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];