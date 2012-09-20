var projectModule = angular.module('project',[]);

projectModule.config(function($routeProvider) {
	$routeProvider.
	when('/', {controller:HomeCtrl, templateUrl:'home.html'}).
	otherwise({redirectTo:'/'});
});


projectModule.factory('modelService', function() {  

	return {
		model : {

		}
	};
});

var jQueryReady = function($scope) {
	$scope.$on('$viewContentLoaded', function() {
		headers(main);
	});
}

function HomeCtrl($scope, modelService) {
	jQueryReady($scope);
}

function BaseCtrl($scope, modelService) {
	jQueryReady($scope);
}
