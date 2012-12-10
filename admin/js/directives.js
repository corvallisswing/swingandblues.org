'use strict';

/* Directives */


angular.module('myApp.directives', []).
	directive('appVersion', ['version', function(version) {
		return function(scope, elm, attrs) {
			elm.text(version);
		};
	}]);

angular.module('myApp.directives', []).
	directive('sbActiveOn', function() {
		return function(scope, elm, attrs) {

			var updateActive = function(paymentStatus) {
				if (paymentStatus === attrs.sbActiveOn) {
					scope.active = "active";        
				}
				else {
					scope.active = "";
				}
			};

			// watch the expression, and update the UI on change.
      scope.$watch(attrs.sbStatus, function() {
        updateActive(attrs.sbStatus);
      });

      updateActive(attrs.sbStatus);
		};
	});

