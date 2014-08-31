var main = function () {
    var dependencies = [];
    var app = angular.module('project', dependencies);

    app.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);
}();

