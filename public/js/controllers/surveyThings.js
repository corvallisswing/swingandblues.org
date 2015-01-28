'use strict';

function SurveyThings(surveySession, $scope, $http, surveyFlow) {
    var session = surveySession;
    surveyFlow.setScreen(surveyFlow.screens.things);

    $scope.survey = session.things;
    if (!$scope.survey.howLongUnits) {
        $scope.survey.howLongUnits = 'months';
    }

    $scope.answer = function (label, choice) {
        $scope.survey[label] = choice;
    };

    $scope.is = function (label, choice) {
        return $scope.survey[label] === choice;
    };

    $scope.next = function () {
        // Save to local session
        session.things = $scope.survey;
        session.save();

        // Save to server
        $http.put('/survey/data', session)
        .success(function (data, status) {
            surveyFlow.next(session);    
        })
        .error(function (data, status) {
            console.log(data);
            // TODO: Site is broken. Handle it?
        });
    };

    $scope.finish = function () {
        session.things = $scope.survey;
        session.save();

        surveyFlow.submit(session, function () {
            surveyFlow.goTo(surveyFlow.screens.thanks);
        });
    };
}
SurveyThings.$inject = ['surveySession','$scope', '$http', 'surveyFlow'];
