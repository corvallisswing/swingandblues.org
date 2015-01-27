'use strict';

function SurveyStart(surveySession, $scope, $http, surveyFlow) {
    var session = surveySession;
    surveyFlow.setScreen(surveyFlow.screens.start);

    $scope.survey = session.survey;

    var jQuery;
    
    $scope.next = function () {
        // Save to local session
        session.survey = $scope.survey;
        session.save();

        // Save to server
        $http.put('/survey/data', session.survey)
        .success(function (data, status) {
            surveyFlow.next(session);    
        })
        .error(function (data, status) {
            console.log(data);
            // TODO: Site is broken. Handle it?
        });
    };

    $scope.finish = function () {
        session.survey = $scope.survey;
        session.save();

        surveyFlow.submit(session.survey, function () {
            surveyFlow.goTo(surveyFlow.screens.thanks);
        });
    };

    $scope.$watch('$viewContentLoaded', function() {   
        jQuery = jQueryThings(); // Defined in jQueryThings.js
    });
}
SurveyStart.$inject = ['surveySession','$scope', '$http', 'surveyFlow'];
