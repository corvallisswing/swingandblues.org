'use strict';

function SurveyStart(session, $scope, $http, surveyFlow) {
    surveyFlow.setScreen(surveyFlow.screens.start);

    var jQuery;
    
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

    $scope.decline = function () {
        session.person = $scope.person;
        session.save();

        rsvpFlow.submit(session, function () {
            rsvpFlow.goTo(rsvpFlow.screens.declined);
        });
    };

    $scope.$watch('$viewContentLoaded', function() {   
        jQuery = jQueryThings(); // Defined in jQueryThings.js
    });
}
SurveyStart.$inject = ['session','$scope', '$http', 'surveyFlow'];
