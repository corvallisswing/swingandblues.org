'use strict';

function SurveyThings(surveySession, $scope, $http, surveyFlow) {
    var session = surveySession;
    surveyFlow.setScreen(surveyFlow.screens.things);

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

        surveyFlow.submit(session, function () {
            surveyFlow.goTo(surveyFlow.screens.thanks);
        });
    };
}
SurveyThings.$inject = ['surveySession','$scope', '$http', 'surveyFlow'];
