'use strict';


// Declare app level module which depends on filters, and services
angular.module('myApp', ['myApp.filters', 'myApp.services', 'myApp.directives']).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/guests', {templateUrl: 'partials/guests.html', controller: GuestsCtrl});
    $routeProvider.when('/payments', {templateUrl: 'partials/payments.html', controller: PaymentsCtrl});
    $routeProvider.when('/housing', {templateUrl: 'partials/housing.html', controller: HousingCtrl});
    $routeProvider.when('/shirts', {templateUrl: 'partials/shirts.html', controller: ShirtsCtrl});
    $routeProvider.when('/carpool', {templateUrl: 'partials/carpool.html', controller: CarpoolCtrl});
    $routeProvider.when('/train', {templateUrl: 'partials/train.html', controller: TrainCtrl});
    $routeProvider.when('/volunteers', {templateUrl: 'partials/volunteers.html', controller: VolunteersCtrl});
    $routeProvider.when('/blues', {templateUrl: 'partials/blues.html', controller: BluesCtrl});
    $routeProvider.when('/diet', {templateUrl: 'partials/diet.html', controller: DietCtrl});
    $routeProvider.when('/welcome', {templateUrl: 'partials/welcome.html', controller: WelcomeCtrl});
    $routeProvider.when('/send-survey', {templateUrl: 'partials/send-survey.html', controller: SendSurveyCtrl});    
    $routeProvider.when('/all', {templateUrl: 'partials/all.html', controller: AllCtrl});

    $routeProvider.when('/survey', {templateUrl: 'partials/survey.html', controller:SurveyCtrl});
    $routeProvider.when('/survey/next-year', {templateUrl: 'partials/survey/next-year.html', controller:SurveyNextYearCtrl});
    $routeProvider.when('/survey/music', {templateUrl: 'partials/survey/music.html', controller:SurveyMusicCtrl});
    $routeProvider.when('/survey/who', {templateUrl: 'partials/survey/who.html', controller:SurveyWhoCtrl});


    $routeProvider.otherwise({redirectTo: '/guests'});
  }]);
