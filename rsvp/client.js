var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:PersonCtrl, templateUrl:'start.html'}).
	when('/2', {controller:PaymentCtrl, templateUrl:'2.html'}).
	when('/thanks', {controller:ThanksCtrl, templateUrl:'thanks.html'}).
	otherwise({redirectTo:'/'});
});


projectModule.factory('personService', function() {  

	// Defaults. Also useful if you don't want to crash
	// when checking property values.
	return {
		person : {
			dancer : {
				role : "mystery",
				"canHaz": false
			},
			payment : {
				method : "never"
			},
			"travel": {
				"train": false,
				"carpool": false,
				"zip": ""
  			},
  			"housing": {
				"host": false,
				"guest": false
  			},
  			"shirt": {
				"want": false
  			},
  			"volunteer": {
				"want": false
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
	$scope.frowns = {		
		name : "",
		email : "",
		role : ""
	};

	$scope.onward = function() {		
		personService.person = $scope.person;

		var person = $scope.person;
		var frowns = $scope.frowns;

		// Frown if name or email is empty.
		frowns.name = !person.name ? true : "";
		frowns.email = !person.email ? true : "";

		// Frown if dancer role is default
		frowns.role = person.dancer.role === "mystery" ? true : "";

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				return;
			}
		}

		$location.path("/2");	
	};

	$scope.removeFrown = function (frown) {
		if ($scope.frowns[frown]) {
			$scope.frowns[frown] = "";	
		}

		hideInvalidFormTip();
	}
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
