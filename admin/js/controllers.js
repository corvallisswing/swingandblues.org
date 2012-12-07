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


function MyCtrl2() {
}
MyCtrl2.$inject = [];
