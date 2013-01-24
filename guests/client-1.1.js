var __usingAngular = true;
var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:MainCtrl, templateUrl:'main.html'}).
	when('/food', {controller:MainCtrl, templateUrl:'food.html'}).
	otherwise({redirectTo:'/'});
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

