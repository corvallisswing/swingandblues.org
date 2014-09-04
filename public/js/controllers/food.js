'use strict';

function FoodCtrl(rsvp, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.food);

    $scope.allergies = {};
    $scope.diet = {};

    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };

    $scope.next = function () {
        rsvpFlow.next();
    };

    $scope.$watch('diet.vegan', function () {
        if ($scope.diet.vegan) {
            $scope.allergies.milk = true;
            $scope.allergies.eggs = true;
            choseVegetarian();  
        }
    });

    $scope.$watch('diet.vegetarian', function () {
        if ($scope.diet.vegetarian) {
            choseVegetarian();
        }
    });

    var choseVegetarian = function () {
        $scope.allergies.fish = true;
        $scope.allergies.shellfish = true;
    };
}
FoodCtrl.$inject = ['rsvp','$scope', '$http', 'rsvpFlow'];