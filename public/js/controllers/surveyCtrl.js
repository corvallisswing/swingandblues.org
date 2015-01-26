'use strict'

function SurveyCtrl(session, $scope, surveyFlow) {
    
    $scope.toggle = function (name) {
        if (!$scope[name]) {
            $scope[name] = true;
        }
        else {
            $scope[name] = false;
        }
    };

    $scope.startOver = function () {
        session.expire();
        surveyFlow.startOver();
    };
}
SurveyCtrl.$inject = ['session', '$scope', 'surveyFlow'];
