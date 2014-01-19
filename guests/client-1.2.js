var __usingAngular = true;
var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:MainCtrl, templateUrl:'main.html'}).
	when('/food', {controller:MainCtrl, templateUrl:'food.html'}).
	when('/volunteers', {controller:VolunteersCtrl, templateUrl: 'volunteers.html'}).
	when('/volunteers/:who', {controller:VolunteersCtrl, templateUrl: 'volunteers.html'}).
	when('/volunteers/:who/:exactly', {controller:VolunteersCtrl, templateUrl: 'volunteers.html'}).
	otherwise({redirectTo:'/'});
});

projectModule.filter('capitalize', function() {
	// http://scofred.com/2013/12/20/angularjs-filter-to-auto-capitalize-the-first-letter/
	return function (input, scope) {
		if (!input) {
			return "";
		}
		if (input!=null) {
			input = input.toLowerCase();
		}	
 		return input.substring(0,1).toUpperCase()+input.substring(1);
	}
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

function MainCtrl($scope, $location, $window) {
	initController($scope, $location, $window);
}

function VolunteersCtrl($scope, $location, $window, $routeParams, $http) {
	initController($scope, $location, $window);

	var showSchedule = function (name, exactly) {
		if (name) {
			$scope.name = name;	
		}
		if (exactly) {
			$scope.exactly = exactly;
		}
		
		var friday = [];
		var saturday = [];
		var sunday = [];
		var personList = {};

		var requestUrl = '/data/volunteers/shifts/' + name;
		if (exactly) {
			requestUrl += '/' + exactly;
		}

		$http.get(requestUrl)
		.success(function (data) {
			for (var key in data) {
				var entry = data[key];
				if (entry.day === "Friday") {
					friday.push(entry);
				}
				if (entry.day === "Saturday") {
					saturday.push(entry);
				}
				if (entry.day === "Sunday") {
					sunday.push(entry);
				}

				// for name conflicts
				personList[entry.person] = entry.person;
			}

			// do we have name conflicts?
			$scope.personList = personList;
			$scope.personCount = 0;
			for (var person in personList) {
				$scope.personCount++;
			}

			$scope.friday = friday;
			$scope.saturday = saturday;
			$scope.sunday = sunday;
		});
	}

	$scope.showSchedule = function(name, exactly) {
		var path; 
		if (name && name !== undefined) {
			path = "/volunteers/" + name
			if (exactly && exactly !== undefined) {
				path += '/' + exactly;
			}
		}

		if (path) {
			$location.path(path);
		}
	};

	if ($routeParams.who) {
		$scope.volunteer = {};
		$scope.volunteer.name = $routeParams.who;
		showSchedule($routeParams.who, $routeParams.exactly);
	}
}

