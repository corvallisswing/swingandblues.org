var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:PersonCtrl, templateUrl:'start.html'}).
	when('/payment', {controller:PaymentCtrl, templateUrl:'payment.html'}).
	when('/thanks', {controller:ThanksCtrl, templateUrl:'thanks.html'}).
	otherwise({redirectTo:'/'});
});


projectModule.factory('personService', function() {  
	return {
		person : {
			dancer : {
				role : "mystery"
			},
			payment : {
				method : "never"
			}
		}
	};
});

// We call this instead of jQuery's document.ready,
// because it doesn't work that way if we're using
// Angular templates / routes.
//
// TODO: It has been suggested that the Angular way
// is to use a 'directive' instead. Well, this works
// as is, so feel free to figure that out, future-self.
function initController($scope) {
	$scope.$on('$viewContentLoaded', main);
}

function PersonCtrl($scope, $location, personService) {
	initController($scope);
	$scope.person = personService.person;

	$scope.toPayment = function() {        
		personService.person = $scope.person;
		// TODO: Form validation checking
		$location.path("/payment");
	};
}


function PaymentCtrl($scope, $http, $location, personService) {
	initController($scope);
	$scope.person = personService.person; 

	$scope.submit = function() {
		personService.person = $scope.person;	
		// TODO: Form validation checking.

		var res = $http.put('/rsvp/submit/', $scope.person);
		res.success(function() {
			// The server is happy.
			$location.path("/thanks");
		});

		res.error(function(data, status, headers, config) {			
			// TODO: Do something with the error message,
			// like please ask the user to email us the
			// json data directly.
			console.log(data);
		});		
	};
}

function ThanksCtrl($scope, personService) {
	initController($scope);
	$scope.person = personService.person; 
}
