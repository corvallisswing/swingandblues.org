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
		$scope.guestCount = data.length;
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

	$scope.paymentAmount = function(amount, guest) {
		var action = {};
		action.amount = amount;
		action.id = guest.id;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/payments/amount/', action);
		res.success(function() {
			getGuestData();
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
		$scope.guestCount = data.length;
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

	getGuestData();
	getHostData();
}
HousingCtrl.$inject = ['$scope','$http'];


function ShirtsCtrl($scope, $http) {

	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';

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
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/shirts')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();

	$scope.isEmailing = {};
	$scope.sendEmail = function(guest) {

		if ($scope.isEmailing[guest.email]) {
			// Do nothing.
			console.log("Already emailing " + guest.email + ". Wait.");
			return;
		}
		$scope.isEmailing[guest.email] = true;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/shirt/email', guest);
		res.success(function() {
			console.log("ok");
			getGuestData();
			$scope.isEmailing[guest.email] = false;
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$scope.isEmailing[guest.email] = false;
		});				
	};
}
ShirtsCtrl.$inject = ['$scope','$http'];


function CarpoolCtrl($scope, $http) {
	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/travel/carpool')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
CarpoolCtrl.$inject = ['$scope','$http'];


function TrainCtrl($scope, $http) {
	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/travel/train')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
TrainCtrl.$inject = ['$scope','$http'];


function VolunteersCtrl($scope, $http) {
	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/volunteers')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
VolunteersCtrl.$inject = ['$scope','$http'];


function BluesCtrl($scope, $http) {
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};		
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/blues')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();
}
BluesCtrl.$inject = ['$scope','$http'];

function WelcomeCtrl($scope, $http) {

	// TODO: Refactor this duplicate (quadricate) code ....
	var getGuestsSuccess = function(data, status, headers, config) {
		$scope.guests = data;
		$scope.guestCount = data.length;
		$scope.loggedOut = '';
	};

	var getGuestsFailure = function(data, status, headers, config) { 
		// Access denied, likely.
		$scope.guests = {};
		$scope.loggedOut = true;
	};

	var getGuestData = function() {
		$http.get('/data/admin/welcome')
		.success(getGuestsSuccess)
		.error(getGuestsFailure);
	};

	getGuestData();

	$scope.isEmailing = {};
	$scope.sendEmail = function(guest) {

		if ($scope.isEmailing[guest.email]) {
			// Do nothing.
			console.log("Already emailing " + guest.email + ". Wait.");
			return;
		}
		$scope.isEmailing[guest.email] = true;

		// PUT the new status to the server.
		var res = $http.put('/data/admin/welcome/email', guest);
		res.success(function() {
			console.log("ok");
			getGuestData();
			$scope.isEmailing[guest.email] = false;
		});

		res.error(function(data, status, headers, config) {			
			console.log(data);
			$scope.isEmailing[guest.email] = false;
		});				
	};
}
WelcomeCtrl.$inject = ['$scope','$http'];


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


