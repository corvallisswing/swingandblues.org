'use strict';

$(document).ready(function () {
	var appendFeelingsPieChart = function () {
	 	var width = 500, height = 240, radius = 100,
		color = d3.scale.ordinal()
			.range(["#E0A269", "#A56222", "#7A3B00", "#ff8c00"]);
			//.range(["#8c8", "#494", "#060", "#ff8c00"]);

		d3.json("/data/survey/music", function(error, json) {
			var ratingNames = ["fun","awesome","favorite"];
			var ratingGlyphs = ["Fun :-)", "Awesome :-) :-)", "My favorite ♥"];
			for (var key in json) {
				// Fill out the data with 0s if there are no
				// votes for a particular rating.
				ratingNames.forEach(function (value, index) {
					if (!json[key][value]) {
						json[key][value] = 0; 
					}
				});

				// Set 'ratings' to be an array of name:value pairs.
				json[key].ratings = $.map(ratingNames, function (name) {
					return {
						name: name,
						value: json[key][name]
					}
				});

				// Let each object know its name.
				json[key].eventName = key;
			}
			
			var eventData = json.nextYear.ratings;

			// Adapted from: https://gist.github.com/enjalot/1203641
			var vis = d3.select("#chart")
				.append("svg:svg")          //create the SVG element inside the <body>
				.data([eventData])               //associate our data with the document
				.attr("width", width)           //set the width and height of our visualization (these will be attributes of the <svg> tag
				.attr("height", height)
				.append("svg:g")            //make a group to hold our pie chart
				.attr("transform", "translate(" + 145 + "," + 120 + ")");
		 
			var arc = d3.svg.arc()          //this will create <path> elements for us using arc data
				.outerRadius(radius);
		 
		 	// this will create arc data for us given a list of values
			var pie = d3.layout.pie().value(function (d) { 
				return d.value; 
			});
		 
			var arcs = vis.selectAll("g.slice")
				.data(pie)
				.enter().append("svg:g")
				.attr("class", "slice");
		 
				arcs.append("svg:path")
					.attr("fill", function(d, i) { return color(i); } ) 
					.attr("d", arc);                                    
		 
			var legend = vis.selectAll(".legend")
				.data(ratingNames.slice().reverse())
				.enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

			var circleRadius = 9;
			legend.append("circle")
				.attr("cx", width - 325)
				.attr("cy", -47)
				.attr("r", circleRadius)
				.style("fill", function (d, i) { return color(ratingNames.length - i - 1); });

			legend.append("text")
				.attr("x", width - 325 + 25 - circleRadius)
				.attr("y", -38 - circleRadius)
				.attr("dy", ".35em")
				.text(function(d, i) { return ratingGlyphs[ratingNames.length - i - 1]; });		
		});	
	};

	appendFeelingsPieChart();
});