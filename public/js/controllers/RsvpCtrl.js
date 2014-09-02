'use strict';

function RsvpCtrl($scope, $http, rsvpFlow) {
 
    var jQuery;
    $scope.person = {};
    $scope.frowns = {};

    initFrown('name');
    initFrown('email');
    initFrown('role');

    var maybeShowFrowns = function () {
        var frowns = $scope.frowns;
        var person = $scope.person;

        // Frown if name or email is empty.
        frowns.name = !person.name ? true : "";
        frowns.email = !person.email ? true : "";

        // // Frown if dancer role is default
        // frowns.role = (person.dancer.role === "mystery") ? true : "";
        // // Also frown if it's a follow, because we're sold out.
        // if ($scope.isFollowsSoldOut && person.dancer.role === "follow") {
        //     frowns.role = true;
        // }

        // If we have a frown, don't navigate.
        for (var frown in frowns) {
            if (frowns[frown]) {                
                jQuery.showInvalidFormTip();
                return false;
            }
        }

        return true;
    };


    function initFrown (name) {
        if ($scope.frowns[name]) {
            $scope.frowns[name] = "";  
        }
    };


    $scope.next = function () {
        var isFormValid = maybeShowFrowns();
        if (!isFormValid) {
            return;
        }

        // var data = {
        //     name: "Test Name"
        // };

        // rsvpFlow.next();

        // $http.put('/rsvp/data', data)
        // .success(function (data, status) {
            
        // })
        // .error(function (data, status) {
        //     // TODO: Logging ...
        // });

        console.log("RSVP");
    };

    $scope.isFrowny = function (name) {
        return $scope.frowns[name];
    };

    $scope.removeFrown = function (name) {
        if ($scope.frowns[name]) {
            $scope.frowns[name] = "";  
        }

        jQuery.hideInvalidFormTip();
    };

    $scope.$watch('$viewContentLoaded', function() {   
        jQuery = jQueryThings(); // Defined in jQueryThings.js
    });
}
RsvpCtrl.$inject = ['$scope', '$http', 'rsvpFlow'];
