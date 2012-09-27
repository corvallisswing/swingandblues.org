// var main = function () {
$(document).ready(function () {
	// Use jQuery to hack out a centered logo
	var logo = $("#logo");

	var handleResize = function() {	
		var halfWindow = $(window).height()/2;
		var halfLogo = logo.height()/2;		
		var navbar = $("#topnav");

		var padding = halfWindow - halfLogo - navbar.height();
		padding += 'px';

		logo.css('padding-top', padding);	
	};

	$(window).resize(handleResize);
	// Update things after the logo has finished loading.
	// If you ever switch back from Angular to pure jQuery, use this
	$('#logoImage').load(handleResize);
	// ... or when things are actually ready (set in header-footer.js).
	$('body').bind('actuallyReady', handleResize);

	// With using Angular, now we just call this directly.
	// handleResize();
	// logo.css('display','block');

	// A simple visualization for attendance.
	var showAttendance = function(roles) {

		var attendanceLimit = 150;
		var maxRowSize = 32;		
				
		// Fisher-Yates shuffle ...
    	// http://stackoverflow.com/questions/962802/is-it-correct-to-use-javascript-array-sort-method-for-shuffling
		var shuffle = function (array) {
	    	var tmp, current, top = array.length;

    		if(top) while(--top) {
		        current = Math.floor(Math.random() * (top + 1));
        		tmp = array[current];
        		array[current] = array[top];
        		array[top] = tmp;
    		}

    		return array;
		};

		var getRolesViewModel = function(roles) {
			var leadCount   = roles.lead;
			var followCount = roles.follow;
			var bothCount   = roles.both;

			// Overrides for test.
			leadCount   = 5;
			followCount = 5;
			bothCount   = 5;

			var data = [];
			for (var leads=0; leads < leadCount; leads++) {
				data.push('lead');			
			}
			for (var follows=0; follows < followCount; follows++) {
				data.push('follow');			
			}
			for (var both=0; both < bothCount; both++) {
				data.push('both');			
			}
			for (var finish=(leads+follows+both); finish < attendanceLimit; finish++) {
				data.push('empty');
			}

			return shuffle(data);
		};

		var attendanceGraph = function(x) {
			// Hyperbola
			return Math.ceil(maxRowSize / (x));
		};

		var createEmptyAttendanceView = function() {
			var $body = $('#attendance');
			$body.css('width', maxRowSize * 19);

			var rowCount = 1;
			var currentDrawCount = 0;
			var visibleRowSize;
			for (var i=0; i < attendanceLimit; i++) {
				$body.append("<div class='circle'><div class='inner'/></div>");
				currentDrawCount++;
			
				visibleRowSize = attendanceGraph(rowCount);
				if (currentDrawCount === visibleRowSize) {
					// We're working in a box, here, as we're in HTML
					// land. We need to pad out the rest of the box with
					// 'blank' things.
					for (var j=0; j < (maxRowSize - visibleRowSize); j++) {
						$body.append("<div class='blank'/>");
					}

					// New row ...
					currentDrawCount = 0;
					rowCount++;
				}	
			}
		};
		
		var createAttendanceView = function(roles) {
			var index = 0;
			var rolesList = getRolesViewModel(roles);

			createEmptyAttendanceView();

			$('.circle').each(function() {
				$(this).addClass(rolesList[index]);
				index++;
			});
		};

		createAttendanceView(roles);
	};

	$.get('/data/roles/', function(data) {
		showAttendance(data);
	}); 
});