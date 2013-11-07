'use strict';

/* Filters */

angular.module('myApp.filters', []).
  filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }]).
  filter('shirtStyle', function() {
  	return function (shirtStyle) {

  		switch (shirtStyle) {
  			case "swing.woman":
  				return "woman.red";
  			case "blues.woman":
  				return "woman.yellow";
  			case "swing.man":
  				return "man.red";
  			case "blues.man":
  				return "man.yellow";
  			default:
  				return "unknown";
  		}
	}
  });
