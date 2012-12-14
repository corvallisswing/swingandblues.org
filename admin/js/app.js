'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/guests', {templateUrl: 'partials/guests.html', controller: GuestsCtrl});
    $routeProvider.when('/payments', {templateUrl: 'partials/payments.html', controller: PaymentsCtrl});
    $routeProvider.when('/housing', {templateUrl: 'partials/housing.html', controller: HousingCtrl});
    $routeProvider.when('/volunteers', {templateUrl: 'partials/volunteers.html', controller: VolunteersCtrl});
    $routeProvider.when('/all', {templateUrl: 'partials/all.html', controller: AllCtrl});
    $routeProvider.otherwise({redirectTo: '/guests'});
  }]);
