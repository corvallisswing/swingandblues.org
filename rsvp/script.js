var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:PersonCtrl, templateUrl:'start.html'}).
	when('/payment', {controller:PaymentCtrl, templateUrl:'payment.html'}).
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
		$location.path("/payment");
	};
}


function PaymentCtrl($scope, personService) {

	$scope.person = personService.person; 
}
