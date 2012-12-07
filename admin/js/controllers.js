'use strict';

/* Controllers */


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