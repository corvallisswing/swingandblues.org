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

var getAttendance = function($http, successCallback) {

	var getAttendanceSuccess = function(data, status, headers, config) {
		if (successCallback) {
			successCallback(parseInt(data));
		}
	};

	var getAttendanceFailure = function(data, status, headers, config) { 
		// ???
		console.log(data);
	};

	$http.get('/data/attendance/')
		.success(getAttendanceSuccess)
		.error(getAttendanceFailure);
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
			if (callback) {
				callback();	
			}
			$scope.isEmailing[guest.email] = false;
		});

		res.error(function(data, status, headers, config) {			
			console.log(status);
			console.log(headers);
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

	$scope.getDate = function (timestamp) {
		var d = new Date(timestamp);
		return d.toLocaleDateString();
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


function ShirtsCtrl($scope, $http, $filter) {

	var onDataUpdate = function() {
		var data = $scope.guests;
		$scope.sums = {};

		for (var i=0; i < data.length; i++) {
			var d = data[i];
			if (d.shirt && d.shirt.size && d.shirt.style) {
				var shirtType = $filter('shirtStyle')(d.shirt.style) + "." + d.shirt.size;
				if (!$scope.sums[shirtType]) {
					$scope.sums[shirtType] = 0;
				}
				$scope.sums[shirtType]++;
			}
		}
	}

	var refreshData = function() {
		getGuestData($scope, $http, '/data/admin/shirts');	
	};

	getGuestData($scope, $http, '/data/admin/shirts', onDataUpdate);

	$scope.isEmailing = {};
	$scope.sendEmail = sendEmail($scope, $http, '/data/admin/shirt/email', refreshData);
}
ShirtsCtrl.$inject = ['$scope','$http', '$filter'];


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


function DietCtrl($scope, $http) {
	// TODO: This is a bit hacky.
	// Diet data
	getGuestData($scope, $http, '/data/admin/diet');

	// Allergies data
	var getAllergiesSuccess = function(data, status, headers, config) {
		$scope.allergies = data;
	};

	$http.get('/data/admin/allergies')
		.success(getAllergiesSuccess)
		.error(function() {});

	// Guest count
	var rsvpCount = 0;
	getAttendance($http, function (count) {
		rsvpCount = count;
		$scope.rsvpCount = count;
	});

	$scope.getPercentage = function (diet) {
		if (rsvpCount === 0) {
			return 100;
		}
		return Math.ceil(100 * (diet.value / rsvpCount));
	};
}
DietCtrl.$inject = ['$scope','$http'];


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


var appendFeelingsChart = function(eventNames) {
	var margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = 960 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	var x0 = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	var x1 = d3.scale.ordinal();

	var y = d3.scale.linear()
		.range([height, 0]);

	var color = d3.scale.ordinal()
		.range(["#f0f0f0", "#900", "#ff9", "#8c8", "#494", "#060", "#ff8c00"]);

	var xAxis = d3.svg.axis()
		.scale(x0)
		.orient("bottom");

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickFormat(d3.format("2s"));

	var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// All this really does is get the JSON at the URL specified
	// and then calls the callback with that raw JSON. 
	// ... which is cool.
	d3.json("/data/admin/survey/music", function(error, json) {

		var ratingNames = ["absent","sad","lame","fun","awesome","favorite"];
		var allNames = [];
		for (var key in json) {
			allNames.push(key);

			// Fill out the data with 0s if there are no
			// votes for a particular rating.
			ratingNames.forEach(function (value, index) {
				if (!json[key][value]) {
					json[key][value] = 0; 
				}
			});

			// Set 'ratings' to be an array of name:value pairs.
			json[key].ratings = ratingNames.map(function(name) {
				return {
					name: name,
					value: json[key][name]
				}
			});

			// Let each object know its name.
			json[key].eventName = key;
		}
				
		x0.domain(eventNames);
		x1.domain(ratingNames).rangeRoundBands([0, x0.rangeBand()]);
		y.domain([0, 25]); // TODO ... need a range to match the data.
		
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Guests");

		
		var eventData = [];
		eventNames.forEach(function (value, index) {
			eventData.push(json[value]);
		});

		var eventGroup = svg.selectAll(".event")
			.data(eventData)
			.enter().append("g")
			.attr("class", "g")
			.attr("transform", function(item) { 
				// Move the rectangles for each event to the
				// right place on the x-axis.
				return "translate(" + x0(item.eventName) + ",0)"; 
			});

		// Use the 'ratings' mapping we made above to 
		// create a rect object with the proper attributes.
		eventGroup.selectAll("rect")
			.data(function(d) { 
				return d.ratings; 
			})
			.enter().append("rect")
			.attr("width", x1.rangeBand())
			.attr("x", function(d) { return x1(d.name); })
			.attr("y", function(d) { return y(d.value); })
			.attr("height", function(d) { return height - y(d.value); })
			.style("fill", function(d) { return color(d.name); });


		var legend = svg.selectAll(".legend")
			.data(ratingNames.slice().reverse())
			.enter().append("g")
			.attr("class", "legend")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) { return d; });		
	});
};

function SurveyNextYearCtrl($scope, $http) {
	getSurveyData($scope, $http, '/data/admin/survey/music');

	appendFeelingsChart(["nextYear"]);
}
SurveyNextYearCtrl.$inject = ['$scope', '$http'];

function SurveyMusicCtrl($scope, $http) {	
	getSurveyData($scope, $http, '/data/admin/survey/music');

	appendFeelingsChart(["walker","breakersYard","gumbo","kevinSelfe"]);
	appendFeelingsChart(["fridayEveSwing","fridayLateBlues","saturdayEveSwing",
		"saturdayLateBlues","saturdayLateSwing","sundayAfternoon","sundayEvening"]);
}
SurveyMusicCtrl.$inject = ['$scope', '$http'];


var dancerChart = function() {
	var margin = {top: 50, right: 60, bottom: 30, left: 40},
			_width = 350 - margin.left - margin.right,
			_height = 250 - margin.top - margin.bottom;

	var _x = d3.scale.linear()
		.range([0, _width]);

	var _y = d3.scale.ordinal();
	var ratingNames = ["what", "sad", "lame", "fun", "awesome", "favorite"];
	_y.range(ratingNames);
	_y.rangePoints([0, _height]);
	
	var _xAxis = d3.svg.axis()
		.scale(_x)
		.orient("bottom");

	var _yAxis = d3.svg.axis()
		.scale(_y)
		.orient("left");

	var _appendSvg = function(selector) {
		return d3.select(selector).append("svg")
			.attr("width", _width + margin.left + margin.right)
			.attr("height", _height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	};

	return {
		x : _x,
		y : _y,
		xAxis : _xAxis,
		yAxis : _yAxis,
		height : _height,
		width : _width,
		appendSvg : _appendSvg
	}
};

var appendDancerChart = function(cx, cy, xLabel, colorName, title) {
	
	var chart = dancerChart();
	var color = d3.scale.ordinal().range([colorName]);

	var svg = chart.appendSvg("#chart");

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", chart.width / 2)
		.attr("y", -20)
		.text(title);

	d3.json("/data/admin/survey/dancers", function(error, json) {

		// Set up data.
		json.forEach(function(d) {
			d.allTime = +d.allTime;
			d.bluesTime = +d.bluesTime;
			d.swingTime = +d.swingTime;

			if (d.timeUnit === "months") {
				d.allTime = d.allTime / 12.0;
				d.bluesTime = d.bluesTime / 12.0;
				d.swingTime = d.swingTime / 12.0;
			}
	  	});

		// Set chart domain ...
		chart.x.domain(d3.extent(json, function(d) { return d.swingTime; })).nice();
	  	chart.y.domain(["<3", ":-) :-)", ":-)", ":-\\", ":-(", "??"]);


	  	svg.append("g")
		  	.attr("class", "x axis")
		  	.attr("transform", "translate(0," + chart.height + ")")
		  	.call(chart.xAxis)
		  .append("text")
		  	.attr("class", "label")
		  	.attr("x", chart.width)
		  	.attr("y", -6)
		  	.style("text-anchor", "end")
		  	.text("Years (" + xLabel() + ")");

	  	svg.append("g")
		  	.attr("class", "y axis")
		  	.call(chart.yAxis)
		  .append("text")
			.attr("class", "label")
		  	.attr("transform", "rotate(-90)")
		  	.attr("y", 6)
		  	.attr("dy", ".71em")
		  	.style("text-anchor", "end")
		  	.text("");

	  	svg.selectAll(".dot" + colorName)
		  	.data(json) // TODO ....
			.enter().append("circle")
		  	.attr("class", "dot" + colorName)
		  	.attr("r", 5)
		  	.attr("cx", function(d) { return chart.x(cx(d)); })
		  	.attr("cy", function(d) { return chart.y(cy(d)); })
		  	.style("fill", function(d) { return color(d); })
		  	.style("opacity", 0.3);
	});
};

var appendMixedChart = function() {
	var chart = dancerChart();
	var color = d3.scale.ordinal().range(['black']);

	var svg = chart.appendSvg("#chart");

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", chart.width / 2)
		.attr("y", -20)
		.text("Swing and blues experience");

	d3.json("/data/admin/survey/dancers", function(error, json) {

		// Set up data.
		json.forEach(function(d) {
			d.allTime = +d.allTime;
			d.bluesTime = +d.bluesTime;
			d.swingTime = +d.swingTime;

			if (d.timeUnit === "months") {
				d.allTime = d.allTime / 12.0;
				d.bluesTime = d.bluesTime / 12.0;
				d.swingTime = d.swingTime / 12.0;
			}
	  	});

		// Set chart domain ...
		chart.x.domain(d3.extent(json, function(d) { return d.swingTime; })).nice();
	  	chart.y.domain(["<3", ":-) :-)", ":-)", ":-\\", ":-(", "??"]);

	  	
	  	svg.append("g")
		  	.attr("class", "x axis")
		  	.attr("transform", "translate(0," + chart.height + ")")
		  	.call(chart.xAxis)
			.append("text")
		  	.attr("class", "label")
		  	.attr("x", chart.width)
		  	.attr("y", -6)
		  	.style("text-anchor", "end")
		  	.text("Years");

	  	svg.append("g")
		  	.attr("class", "y axis")
		  	.call(chart.yAxis)
			.append("text")
			.attr("class", "label")
		  	.attr("transform", "rotate(-90)")
		  	.attr("y", 6)
		  	.attr("dy", ".71em")
		  	.style("text-anchor", "end")
		  	.text("");

	  	svg.selectAll(".line")
		  	.data(json) // TODO ....
			.enter().append("line")
		  	.attr("class", "line")
		  	.attr("x1", function(d) { return chart.x(d.swingTime); })
		  	.attr("y1", function(d) { return chart.y(d.swing); })
		  	.attr("x2", function(d) { return chart.x(d.bluesTime); })
		  	.attr("y2", function(d) { return chart.y(d.blues); })
		  	.attr("stroke", "#888")
		  	.style("fill", function(d) { return color(d); })
		  	.style("opacity", 0.3);

		svg.selectAll(".swingDot")
		  	.data(json) // TODO ....
			.enter().append("circle")
		  	.attr("class", "swingDot")
		  	.attr("cx", function(d) { return chart.x(d.swingTime); })
		  	.attr("cy", function(d) { return chart.y(d.swing); })
		  	.attr("r", 5)
		  	.style("fill", function(d) { return 'red'; })
		  	.style("opacity", 0.3);

		svg.selectAll(".bluesDot")
		  	.data(json) // TODO ....
			.enter().append("circle")
		  	.attr("class", "bluesDot")
		  	.attr("cx", function(d) { return chart.x(d.bluesTime); })
		  	.attr("cy", function(d) { return chart.y(d.blues); })
		  	.attr("r", 5)
		  	.style("fill", function(d) { return 'navy'; })
		  	.style("opacity", 0.3);
	});
};

var linearChart = function() {
	var margin = {top: 50, right: 60, bottom: 30, left: 40},
			_width = 350 - margin.left - margin.right,
			_height = 250 - margin.top - margin.bottom;

	var _x = d3.scale.linear()
		.range([0, _width]);

	var _y = d3.scale.linear()
		.range([_height, 0]);
	
	var _xAxis = d3.svg.axis()
		.scale(_x)
		.orient("bottom");

	var _yAxis = d3.svg.axis()
		.scale(_y)
		.orient("left");

	var _appendSvg = function(selector) {
		return d3.select(selector).append("svg")
			.attr("width", _width + margin.left + margin.right)
			.attr("height", _height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	};

	return {
		x : _x,
		y : _y,
		xAxis : _xAxis,
		yAxis : _yAxis,
		height : _height,
		width : _width,
		appendSvg : _appendSvg
	}
};

var appendAllYearsChart = function() {
	var chart = linearChart();
	var color = d3.scale.ordinal().range(['black']);

	var svg = chart.appendSvg("#laterChart");

	svg.append("text")
		.attr("text-anchor", "middle")
		.attr("x", chart.width / 2)
		.attr("y", -20)
		.text("Dancing experience");

	d3.json("/data/admin/survey/dancers", function(error, json) {

		// Set up data.
		json.forEach(function (d) {
			d.allTime = +d.allTime;

			if (d.timeUnit === "months") {
				d.allTime = d.allTime / 12.0;
			}
	  	});

		// Set chart domain ...
		chart.x.domain(d3.extent(json, function(d) { return d.allTime; })).nice();
	  	chart.y.domain([0,10]);

	  	svg.append("g")
		  	.attr("class", "x axis")
		  	.attr("transform", "translate(0," + chart.height + ")")
		  	.call(chart.xAxis)
		  .append("text")
		  	.attr("class", "label")
		  	.attr("x", chart.width - 4)
		  	.attr("y", -6)
		  	.style("text-anchor", "end")
		  	.text("Years");

	  	svg.append("g")
		  	.attr("class", "y axis")
		  	.call(chart.yAxis)
		  .append("text")
			.attr("class", "label")
		  	.attr("transform", "rotate(-90)")
		  	.attr("y", 6)
		  	.attr("dy", ".71em")
		  	.style("text-anchor", "end")
		  	.text("Guests");

		// Convert the json into an array that a bar chart
		// can be happy with.
		var experience = {};
		json.forEach(function (d) {
			var years = Math.floor(d.allTime);

			if (!experience[years]) {
				experience[years] = { year: years, count: 0};
			}

			experience[years].count++;
		});

		var experienceArray = [];
		for (var key in experience) {
			experienceArray.push(experience[key]);
		}
		json.experience = experienceArray;

		svg.selectAll("rect")
			.data(json.experience)
			.enter().append("rect")
			.attr("width", 10)
			.attr("x", function(d) { return chart.x(d.year); })
			.attr("y", function(d) { return chart.y(d.count); })
			.attr("height", function(d) { return chart.height - chart.y(d.count); })
			.attr("stroke", "#888")
			.style("fill", function(d) { return 'white'; });
	});
};

function SurveyWhoCtrl($scope, $http) {
	getSurveyData($scope, $http, '/data/admin/survey/dancers');
	
	var swingX = function(d) { return d.swingTime; };
	var swingY = function(d) { return d.swing; };
	var swingLabel = function() { return "swing"; };

	var bluesX = function(d) { return d.bluesTime; };
	var bluesY = function(d) { return d.blues; };
	var bluesLabel = function() { return "blues"; };

	appendDancerChart(swingX, swingY, swingLabel, 'red', "Swing experience");
	appendDancerChart(bluesX, bluesY, bluesLabel, 'navy', "Blues experience");

	appendMixedChart();
	appendAllYearsChart();
}

function SurveyCommentsCtrl($scope, $http) {
	getSurveyData($scope, $http, '/data/admin/survey/all');

	$scope.wasPresent = function(survey) {
		if (survey.attendance === "present") {
			return true;
		}

		if (!survey.present) {
			return false;
		}

		if (survey.present.friday
		|| survey.present.saturday
		|| survey.present.sunday) {
			return true;
		}
		else {
			return false;
		}
	};
}
