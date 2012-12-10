'use strict';

/* Controllers */
// function initController($scope, $location) {
// 	$scope.$on('$viewContentLoaded', function() {		
// 		main();
// 	});
// }

function ScopeCtrl($scope) {
	// Empty controller for declaring a new scope level.
}
ScopeCtrl.$inject = ['$scope'];

function GuestsCtrl($scope, $http) {
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/guests')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
GuestsCtrl.$inject = ['$scope','$http'];


function PaymentsCtrl($scope, $http) {

	// TODO: Refactor this duplicate code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/payments')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	$scope.paymentStatus = function(status, guest) {
		var action = {};
		action.status = status;
		action.id = guest.id;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/payments/status/', action);
		res.success(function() {
			// TODO: This might become too slow over time. However, maybe not!
			getGuestData();
			// TODO: Doing something like this would be an option if you can
			// figure out how to fire an event on the 'guest' being modified.
			// var index = $.inArray(guest, $scope.guests)
			// if (index >= 0) {
			// 	console.log("Found");
			// 	var g = $scope.guests[index];
			// 	g.payment.status = action.status;
			// 	$scope.guests[index] = g;
			// }
			// else {
			// 	console.log("Not found");
			// }
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
		});				
	};

	getGuestData();
}
PaymentsCtrl.$inject = ['$scope','$http'];


function HousingCtrl($scope, $http) {
	// TODO: Refactor this duplicate (triplicate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/housing')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
HousingCtrl.$inject = ['$scope','$http'];


function AllCtrl($scope, $http) {
	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/all')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
AllCtrl.$inject = ['$scope','$http'];