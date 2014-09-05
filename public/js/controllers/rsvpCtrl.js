'use strict'

function RsvpCtrl($scope) {
    
    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };
}
RsvpCtrl.$inject = ['$scope'];
