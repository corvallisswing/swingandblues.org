'use strict';

/* Controllers */


function GuestsCtrl($scope, $http) {
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
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
