'use strict';

/* Controllers */


function GuestsCtrl($scope, $http) {
	var getGuestsSuccess = function(data, status, headers, config) {
		if (data === {}) {
			// do nothing. 
		}
		else {
			$scope.guests = data;
		}
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// uhh ... freak out?
		console.log(data);
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
