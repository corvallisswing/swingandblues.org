var Weekend = {};
Weekend.Services = {};

var main = function () {
    var dependencies = [];
    var app = angular.module('project', dependencies);

    // TODO: Do we even use this?
    app.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode(true);
    }]);

    return app;
}();

var app = main;

