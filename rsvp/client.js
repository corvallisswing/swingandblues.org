var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:PersonCtrl, templateUrl:'1.html'}).
	when('/2', {controller:WrapupCtrl, templateUrl:'2.html'}).
	when('/payment', {controller:BaseCtrl, templateUrl:'payment.html'}).
	when('/payment/success', {controller:BaseCtrl, templateUrl:'thanks.html'}).
	when('/payment/soldout', {controller:BaseCtrl, templateUrl:'soldout.html'}).
	when('/error', {controller:BaseCtrl, templateUrl:'error.html'}).	
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


function WrapupCtrl($scope, $http, $location, personService) {
	initController($scope);
	$scope.person = personService.person; 
	$scope.frowns = {
		canHaz : "",
		payment : ""
	};

	$scope.submit = function() {
		personService.person = $scope.person;	
		
		// Form validation checking.
		var person = $scope.person;
		var frowns = $scope.frowns;

		frowns.canHaz = !person.dancer.canHaz ? true : "";
		frowns.payment = person.payment.method === "never" ? true : "";

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				return;
			}
		}

		// Otherwise, submit that form.		
		var res = $http.put('/rsvp/submit/', $scope.person);
		res.success(function() {
			// The server is happy.
			$location.path("/payment");
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$location.path("/error");
		});				
		
// For testing ...		
//		$location.path("/payment");
	};

	// TODO: Figure out a cool way to avoid duplication.
	$scope.removeFrown = function (frown) {
		if ($scope.frowns[frown]) {
			$scope.frowns[frown] = "";	
		}

		hideInvalidFormTip();
	}
}


function BaseCtrl($scope, personService) {
	initController($scope);
	$scope.person = personService.person; 
}
