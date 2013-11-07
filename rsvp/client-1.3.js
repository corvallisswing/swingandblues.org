var __usingAngular = true;
var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:PersonCtrl, templateUrl:'1-0.html'}).
	when('/2', {controller:TravelCtrl, templateUrl:'2.html'}).
	when('/3', {controller:FoodCtrl, templateUrl:'3.html'}).
	when('/4', {controller:WrapupCtrl, templateUrl:'4.html'}).
	when('/payment', {controller:PaymentCtrl, templateUrl:'payment.html'}).
	when('/payment/shirt', {controller:PaymentShirtCtrl, templateUrl:'shirt-payment-1.1.html'}).
	when('/payment/success', {controller:PaymentCtrl, templateUrl:'thanks.html'}).
	when('/payment/soldout', {controller:PaymentCtrl, templateUrl:'soldout.html'}).
	when('/full', {controller:FullCtrl, templateUrl:'full.html'}).
	when('/error', {controller:BaseCtrl, templateUrl:'error.html'}).
	when('/shirt/', {controller:ShirtCtrl, templateUrl:'shirt-1.1.html'}).
	when('/shirt/:who', {controller:ShirtCtrl, templateUrl:'shirt-1.1.html'}).
	when('/no-shirt', {controller:NoShirtCtrl, templateUrl:'no-shirt.html'}).
	when('/survey/', {controller:SurveyCtrl, templateUrl:'survey-home.html'}).
	when('/survey/who/', {controller:SurveyCtrl, templateUrl:'survey-who.html'}).
	when('/survey/music/', {controller:SurveyCtrl, templateUrl:'survey-music.html'}).
	when('/survey/thanks/', {controller:SurveyCtrl, templateUrl:'survey-thanks.html'}).
	when('/survey/error/', {controller:SurveyCtrl, templateUrl:'survey-error.html'}).
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
  			},
  			food: {
  				canHaz: false
  			},
  			diet: {},
  			allergies: {},
  			experience : {
  				site : "both"
  			}
		}
	};
});

projectModule.factory('surveyService', function() {
	return {
		survey : {
			dancer : {
				timeUnit : "years"
			},
			attendance : "present"
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
function initController($scope, $location, $window) {
	$scope.$on('$viewContentLoaded', function() {		
		main();
		setupBlues();
		$window._gaq.push(['_trackPageview', $location.path()]);
	});
}

function SurveyCtrl($scope, $location, $window, $http, surveyService) {
	initController($scope, $location, $window);	

	$scope.survey = surveyService.survey;
	$scope.submitCount = 0;
	$scope.isSubmitting = false;

	var doneSubmitting = function() {
		$scope.isSubmitting = false;
		$scope.submitCount = 0;
	};

	$scope.onward = function(destination) {
		surveyService.survey = $scope.survey;
		$location.path("/survey/" + destination);
	};

	$scope.wantEmail = function() {
		if (!$scope.survey.email) {
			$scope.survey.email = {};
		}
		$scope.survey.email.want = 'true';
	}

	$scope.submit = function() {

		$scope.submitCount++;
		if ($scope.isSubmitting) {
			return;
		}

		$scope.isSubmitting = true;
		surveyService.survey = $scope.survey;	
		
		if (!$scope.survey.email) {
			$scope.survey.email = {};
		}
		if ($scope.survey.email.want && !$scope.survey.email.address) {
			$scope.survey.email.address = "(actually, there seems to be a typo in the address you entered)";
		}

		// Otherwise, submit that form.		
		var res = $http.put('/rsvp/submit/survey/', $scope.survey);
		res.success(function(data) {
			console.log(data);
			// The server is happy.
			$location.path("/survey/thanks");
			doneSubmitting();
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$location.path("/survey/error");
			doneSubmitting();
		});						
	};
}
SurveyCtrl.$inject = ['$scope', '$location', '$window', '$http', 'surveyService'];


// TODO: Much of this is duplicated in TravelCtrl ...
function ShirtCtrl($scope, $location, $window, $routeParams, $http, personService) {
	initController($scope, $location, $window);

	$scope.person = personService.person;
	$scope.params = $routeParams;

	$scope.person.email = $scope.params.who;
	$scope.person.shirt.want = true;
	$scope.person.shirt.size = "";
	$scope.person.shirt.canHaz = "";
	$scope.person.shirt.style = "";
	$scope.hasOrdered = false;

	if ($scope.person.email) {
		$scope.emailProvided = true;
	}
	else {
		$scope.emailProvided = false;
	}

	// todo : ....
	$scope.frowns = {
		canHaz : "",
		style : "",
		size : "",
		email : ""
	};
	$scope.submitCount = 0;
	$scope.isSubmitting = false;

	var doneSubmitting = function() {
		$scope.isSubmitting = false;
		$scope.submitCount = 0;
	};

	$scope.submit = function() {
		$scope.submitCount++;
		if ($scope.isSubmitting) {
			return;
		}

		$scope.isSubmitting = true;
		personService.person = $scope.person;	
		
		// Form validation checking.
		var person = $scope.person;
		var frowns = $scope.frowns;

		frowns.canHaz = !person.shirt.canHaz ? true : "";
		frowns.style = !person.shirt.style ? true : "";
		frowns.size = !person.shirt.size ? true : "";
		frowns.email = !person.email ? true : "";		

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				doneSubmitting();
				return;
			}
		}

		// Otherwise, submit that form.		
		var res = $http.put('/rsvp/submit/shirt/', $scope.person);
		res.success(function(data) {
			console.log(data);
			// The server is happy.
			$location.path("/payment/shirt");
			doneSubmitting();
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$location.path("/error");
			doneSubmitting();
		});						
	};

	$scope.noShirt = function() {
		var res = $http.put('/rsvp/submit/no-shirt/', $scope.person);
		res.success(function(data) {
			$location.path("/no-shirt");
		});

		res.error(function(data, status, headers, config) {			
			$location.path("/error");
		});
	};

	// TODO: Figure out a cool way to avoid duplication.
	$scope.removeFrown = function (frown) {
		if ($scope.frowns[frown]) {
			$scope.frowns[frown] = "";	
		}

		hideInvalidFormTip();
	};

	if ($scope.emailProvided) {
		var res = $http.put('/rsvp/submit/shirt/query', $scope.person);

		res.success(function(data) {
			$scope.person.shirt.canHaz = data.canHaz;
			$scope.person.shirt.style = data.style;
			$scope.person.shirt.size = data.size;
			if (data.canHaz) {
				$scope.hasOrdered = true;
			}
		});

		res.error(function(data, status, headers, config) {			
			// Do nothing.			
		});
	}
}

function NoShirtCtrl($scope, $location, $window) {
	initController($scope, $location, $window);
}

function PaymentShirtCtrl($scope, $location, $window) {
	initController($scope, $location, $window);
}

function FullCtrl($scope, $location, $window, $http) {
	initController($scope, $location, $window);

	var limit = $http.get('/data/attendance/limit/')
	.success(function(limit) {
		$scope.limit = limit;
	});
}

function PersonCtrl($scope, $location, $window, $http, personService) {
	initController($scope, $location, $window);

	// TODO: There is probably a better place for this, to
	// do things the 'Angular' way. Figure that out, future self.
	var remaining = $http.get('/data/attendance/remaining/')
	.success(function(remaining) {
		if (remaining > 0) {
			// Do nothing. We're fine.
		}
		else {
			// We're sold out. Redirect.
			$location.path('/full');
		}
	});

	$http.get('/data/situation/')
	.success(function (situation) {
		$scope.isHousingWaitlistActive = situation.isHousingWaitlistActive;
		$scope.isFollowsSoldOut = situation.isFollowsSoldOut;
	});

	$scope.person = personService.person;
	$scope.frowns = {		
		name : "",
		email : "",
		role : ""
	};

	if (document.domain === "bluesandswing.org") {
		$scope.person.experience.site = "blues";
	}
	else {
		$scope.person.experience.site = "swing";	
	}

	$scope.onward = function() {		
		personService.person = $scope.person;

		var person = $scope.person;
		var frowns = $scope.frowns;

		// Frown if name or email is empty.
		frowns.name = !person.name ? true : "";
		frowns.email = !person.email ? true : "";

		// Frown if dancer role is default
		frowns.role = (person.dancer.role === "mystery") ? true : "";
		// Also frown if it's a follow, because we're sold out.
		if ($scope.isFollowsSoldOut && person.dancer.role === "follow") {
			frowns.role = true;
		}

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


function TravelCtrl($scope, $http, $location, $window, personService) {
	initController($scope, $location, $window);
	$scope.person = personService.person; 
	$scope.frowns = {
		canHaz : "",
	};

	$scope.hasHousingRequest = function () {
		return ($scope.person.housing.guest && 
			!$scope.person.housing.host);
	};

	$scope.onward = function() {
		personService.person = $scope.person;	
		
		// Form validation checking.
		var person = $scope.person;
		var frowns = $scope.frowns;

		frowns.canHaz = !person.dancer.canHaz ? true : "";

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				return;
			}
		}
		
		// otherwise, onward.
		$location.path("/3");
	};

	// TODO: Figure out a cool way to avoid duplication.
	$scope.removeFrown = function (frown) {
		if ($scope.frowns[frown]) {
			$scope.frowns[frown] = "";	
		}

		hideInvalidFormTip();
	};
}


function FoodCtrl($scope, $http, $location, $window, personService) {
	initController($scope, $location, $window);
	$scope.person = personService.person; 
	$scope.frowns = {
		food : "",
	};

	$scope.$watch('person.diet.vegan', function () {
		if ($scope.person.diet.vegan) {
			$scope.person.allergies.milk = true;
			$scope.person.allergies.eggs = true;
			choseVegetarian();	
		}
	});

	$scope.$watch('person.diet.vegetarian', function () {
		if ($scope.person.diet.vegetarian) {
			choseVegetarian();
		}
	});

	var choseVegetarian = function () {
		$scope.person.allergies.fish = true;
		$scope.person.allergies.shellfish = true;
	};

	$scope.onward = function() {
		personService.person = $scope.person;	
		// Form validation checking.
		var person = $scope.person;
		var frowns = $scope.frowns;

		frowns.food = !person.food.canHaz ? true : "";

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				return;
			}
		}
		
		// otherwise, onward.
		$location.path("/4");
	};

	// TODO: Figure out a cool way to avoid duplication.
	$scope.removeFrown = function (frown) {
		if ($scope.frowns[frown]) {
			$scope.frowns[frown] = "";	
		}

		hideInvalidFormTip();
	};
}


function WrapupCtrl($scope, $http, $location, $window, personService) {
	initController($scope, $location, $window);
	$scope.person = personService.person; 
	$scope.frowns = {
		payment : ""
	};
	$scope.submitCount = 0;
	$scope.isSubmitting = false;

	var doneSubmitting = function() {
		$scope.isSubmitting = false;
		$scope.submitCount = 0;
	};

	$scope.submit = function() {
		$scope.submitCount++;
		if ($scope.isSubmitting) {
			return;
		}

		$scope.isSubmitting = true;
		personService.person = $scope.person;	
		
		// Form validation checking.
		var person = $scope.person;
		var frowns = $scope.frowns;

		frowns.payment = person.payment.method === "never" ? true : "";

		// If we have a frown, don't navigate.
		for (frown in frowns) {
			if (frowns[frown]) {				
				showInvalidFormTip();
				doneSubmitting();
				return;
			}
		}

		// We use this to tell who ordered a shirt via the rsvp process
		// and who didn't.
		if ($scope.person.shirt && $scope.person.shirt.canHaz) {
			$scope.person.shirt.status = "rsvp";
		}

		// Otherwise, submit that form.		
		var res = $http.put('/rsvp/submit/', $scope.person);
		res.success(function() {
			// The server is happy.
			$location.path("/payment");
			doneSubmitting();
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$location.path("/error");
			doneSubmitting();
		});				
		
// For testing ...		
//		$location.path("/payment");
	};
}

function PaymentCtrl($scope, $location, $window, personService) {
	initController($scope, $location, $window);
	$scope.person = personService.person; 

	if ($scope.person.experience.site === "blues") {
		$scope.eventName = "Corvallis Blues & Swing Weekend";
	}
	else {
		$scope.eventName = "Corvallis Swing & Blues Weekend";
	}

	
}


function BaseCtrl($scope, $location, $window, personService) {
	initController($scope, $location, $window);
	$scope.person = personService.person; 
}
