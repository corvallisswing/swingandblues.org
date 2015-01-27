'use strict'

function SurveyCtrl(surveySession, $scope, surveyFlow) {
    
    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };

    $scope.startOver = function () {
        surveySession.expire();
        surveyFlow.startOver();
    };
}
SurveyCtrl.$inject = ['surveySession', '$scope', 'surveyFlow'];
