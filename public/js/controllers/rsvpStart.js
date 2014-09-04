'use strict';

function RsvpStart(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.start);

    var jQuery;
    $scope.person = session.person;
    $scope.frowns = {};

    initFrown('name');
    initFrown('email');
    initFrown('role');
    initFrown('canHaz');

    var maybeShowFrowns = function () {
        var frowns = $scope.frowns;
        var person = $scope.person;

        // Frown if name or email is empty.
        frowns.name = !person.name ? true : "";
        frowns.email = !person.email ? true : "";
        frowns.canHaz = !person.canHaz ? true : "";

        // Frown if dancer role is default
        frowns.role = 
            (!person.role || 
             person.role === "mystery") ? true : "";
        // Also frown if it's a follow, because we're sold out.
        // if ($scope.isFollowsSoldOut && person.role === "follow") {
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

    $scope.setRole = function (role) {
        $scope.person.role = role;
        $scope.removeFrown('role');
    };

    $scope.isRole = function (role) {
        return $scope.person.role === role;
    };

    $scope.isNotResident = function () {
        return $scope.person.isResident === false;
    };

    $scope.setResident = function () {
        $scope.person.isResident = true;
        $scope.isMaybeResident = false;
    };

    $scope.setMaybeResident = function () {
        $scope.person.isResident = true;
        $scope.isMaybeResident = true;
    };

    $scope.setNotResident = function () {
        $scope.person.isResident = false;
        $scope.isMaybeResident = false;
    };

    $scope.next = function () {
        var isFormValid = maybeShowFrowns();
        if (!isFormValid) {
            return;
        }

        // Save to local session
        session.person = $scope.person;
        session.save();

        // Save to server
        $http.put('/rsvp/data/person', session.person)
        .success(function (data, status) {
            rsvpFlow.next(session);    
        })
        .error(function (data, status) {
            // TODO: Site is broken. Handle it?
        });
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
RsvpStart.$inject = ['session','$scope', '$http', 'rsvpFlow'];
