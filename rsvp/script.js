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
			payment : "never"
		}
	};
});

function PersonCtrl($scope, $location, personService) {

	$scope.person = personService.person;

	$scope.toPayment = function() {        
		personService.person = $scope.person;
		// TODO: Form validation checking
		$location.path("/payment");
	};
}


function PaymentCtrl($scope, $http, $location, personService) {

	$scope.person = personService.person; 

	$scope.submit = function() {
		personService.person = $scope.person;	
		// TODO: Form validation checking.
		
		var res = $http.put('/rsvp/submit/', $scope.person);
		// TODO: Error checking.
		console.log(res);

		$location.path("/thanks");
	};
}

function ThanksCtrl($scope, personService) {
	$scope.person = personService.person; 
}
