'use strict';

function SurveyMusic(surveySession, $scope, $http, surveyFlow) {
    var session = surveySession;
    surveyFlow.setScreen(surveyFlow.screens.music);

    $scope.survey = session.music;

    $scope.answer = function (label, choice) {
        $scope.survey[label] = choice;
    };

    $scope.is = function (label, choice) {
        return $scope.survey[label] === choice;
    };

    $scope.next = function () {
        session.music = $scope.survey;
        session.save();

        surveyFlow.submit(session, function () {
            surveyFlow.goTo(surveyFlow.screens.thanks);
        });
    };
}
SurveyMusic.$inject = ['surveySession','$scope', '$http', 'surveyFlow'];
