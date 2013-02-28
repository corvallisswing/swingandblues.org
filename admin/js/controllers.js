'use strict';

var getGuestData = function($scope, $http, dataApiUrl, successCallback) {

	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
		if (successCallback) {
			successCallback();
		}
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	$http.get(dataApiUrl)
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
};

var sendEmail = function($scope, $http, dataApiUrl, callback) {

	return function (guest) {
		if ($scope.isEmailing[guest.email]) {
			// Do nothing.
			console.log("Already emailing " + guest.email + ". Wait.");
			return;
		}
		$scope.isEmailing[guest.email] = true;

		// PUT the new status to the server.
		var res = $http.put(dataApiUrl, guest);
		res.success(function() {
			console.log("ok");
			callback();
			$scope.isEmailing[guest.email] = false;
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$scope.isEmailing[guest.email] = false;
		});				
	};
};


//-----------------------------------------------------------
// Controllers 
//-----------------------------------------------------------


function ScopeCtrl($scope) {
	// Empty controller for declaring a new scope level.
}
ScopeCtrl.$inject = ['$scope'];


function GuestsCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/guests');
}
GuestsCtrl.$inject = ['$scope','$http'];


function PaymentsCtrl($scope, $http) {

	var refreshData = function () {
		getGuestData($scope, $http, '/data/admin/payments');
	};

	$scope.paymentStatus = function(status, guest) {
		var action = {};
		action.status = status;
		action.id = guest.id;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/payments/status/', action);
		res.success(function() {
			// TODO: This might become too slow over time. However, maybe not!
			refreshData();
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

	$scope.paymentAmount = function(amount, guest) {
		var action = {};
		action.amount = amount;
		action.id = guest.id;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/payments/amount/', action);
		res.success(function() {
			refreshData();
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
		});				
	};

	refreshData();
}
PaymentsCtrl.$inject = ['$scope','$http'];


function HousingCtrl($scope, $http) {

	var getHostsSuccess = function(data, status, headers, config) {
		$scope.hosts = data;
		$scope.hostCount = data.length;
	};

	var getHostsFailure = function(data, status, headers, config) {
		$scope.hosts = {};
	};

	var getHostData = function() {
		$http.get('/data/admin/housing/hosts')
		.success(getHostsSuccess)
		.error(getHostsFailure);
	};

	getGuestData($scope, $http, '/data/admin/housing');
	getHostData();
}
HousingCtrl.$inject = ['$scope','$http'];


function ShirtsCtrl($scope, $http) {

	var onDataUpdate = function() {
		$scope.sums = {};

		for (var i=0; i < data.length; i++) {
			var d = data[i];
			console.log(d);			
			if (d.shirt && d.shirt.size && d.shirt.style) {
				var shirtType = d.shirt.style + "." + d.shirt.size;
				console.log(shirtType);
				if (!$scope.sums[shirtType]) {
					$scope.sums[shirtType] = 0;
				}
				$scope.sums[shirtType]++;
			}
		}
	}

	getGuestData($scope, $http, '/data/admin/shirts', onDataUpdate);

	$scope.isEmailing = {};
	$scope.sendEmail = sendEmail($scope, $http, '/data/admin/shirt/email', getGuestData);
}
ShirtsCtrl.$inject = ['$scope','$http'];


function CarpoolCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/travel/carpool');
}
CarpoolCtrl.$inject = ['$scope','$http'];


function TrainCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/travel/train');
}
TrainCtrl.$inject = ['$scope','$http'];


function VolunteersCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/volunteers');
}
VolunteersCtrl.$inject = ['$scope','$http'];


function BluesCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/blues');
}
BluesCtrl.$inject = ['$scope','$http'];


function WelcomeCtrl($scope, $http) {

	var refreshData = function() {
		getGuestData($scope, $http, '/data/admin/welcome');
	};

	refreshData();
	$scope.isEmailing = {};
	$scope.sendEmail = sendEmail($scope, $http, '/data/admin/welcome/email', refreshData);
}
WelcomeCtrl.$inject = ['$scope','$http'];


function SendSurveyCtrl($scope, $http) {
	
	var refreshData = function() {
		getGuestData($scope, $http, '/data/admin/surveyed');	
	}

	refreshData();
	$scope.isEmailing = {};
	$scope.sendEmail = sendEmail($scope, $http, '/data/admin/survey/email', refreshData);
}
SendSurveyCtrl.$inject = ['$scope','$http'];

function AllCtrl($scope, $http) {
	getGuestData($scope, $http, '/data/admin/all');
}
AllCtrl.$inject = ['$scope','$http'];



var getSurveyData = function($scope, $http, dataApiUrl, successCallback) {

	var getSurveysSuccess = function(data, status, headers, config) {
		$scope.surveys = data;
		$scope.surveyCount = data.length;
		$scope.loggedOut = '';
		if (successCallback) {
			successCallback();
		}
	};

	var getSurveysFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.surveys = {};
		$scope.loggedOut = true;
	};

	$http.get(dataApiUrl)
		.success(getSurveysSuccess)
		.error(getSurveysFailure);
};

function SurveyCtrl($scope, $http) {
	getSurveyData($scope, $http, '/data/admin/survey/all');
}
SurveyCtrl.$inject = ['$scope', '$http'];

function SurveyNextYearCtrl($scope, $http) {
	getSurveyData($scope, $http, '/data/admin/survey/next-year');
}
SurveyNextYearCtrl.$inject = ['$scope', '$http'];
