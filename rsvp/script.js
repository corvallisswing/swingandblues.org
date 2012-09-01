angular.module('project',[]). 
  config(function($routeProvider) {
    $routeProvider.
      when('/', {controller:Controller, templateUrl:'rsvp.html'}).
      otherwise({redirectTo:'/'});
  });
 
 function Controller($scope) {
  // Defaults
  $scope.master= {
    dancer : { 
      role : "mystery"      
    },
    payment : "never"
  };
 
  $scope.update = function(person) {
    $scope.master= angular.copy(person);
  };
 
  $scope.reset = function() {
    $scope.person = angular.copy($scope.master);
  };
 
  $scope.reset();  
}
