'use strict';

function FoodCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.food);

    $scope.canHaz = session.food.canHaz;
    $scope.allergies = session.food.allergies;
    $scope.diet = session.food.diet;    

    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };

    $scope.next = function () {
        session.food.canHaz = $scope.canHaz;
        session.food.allergies = $scope.allergies;
        session.food.diet = $scope.diet;
        session.save();

        $http.put('/data/food', session.food)
        .success(function () {
            rsvpFlow.next(session);
        });
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
FoodCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];