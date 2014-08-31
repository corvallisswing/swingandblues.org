$(document).ready(function () {

	// A simple visualization for attendance.
	var showAttendance = function(attendanceLimit, roles) {

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
			// return Math.ceil(maxRowSize / (x));

			// Rectangle
			return maxRowSize;
		};

		var createEmptyAttendanceView = function() {
			var $body = $('#attendance');
			// Ignore maxRowSize for the time being, to
			// just be the width of the container.
			// $body.css('width', maxRowSize * 19);

			var rowCount = 1;
			var currentDrawCount = 0;
			var visibleRowSize;
			for (var i=0; i < attendanceLimit; i++) {
				$body.prepend("<a class='circle'><div class='inner'/></a>");
				currentDrawCount++;
			
				visibleRowSize = attendanceGraph(rowCount);
				if (currentDrawCount === visibleRowSize) {
					// We're working in a box, here, as we're in HTML
					// land. We need to pad out the rest of the box with
					// 'blank' things.
					for (var j=0; j < (maxRowSize - visibleRowSize); j++) {
						$body.prepend("<div class='blank'/>");
					}

					// New row ...
					currentDrawCount = 0;
					rowCount++;
				}	
			}
		};

		var getRoleLabel = function(role) {
			switch(role) {
				case 'lead':
					return 'Lead';
				case 'follow':
					return 'Follow';
				case 'both':
					return 'Lead and follow';
				default:
					return 'Both';
			}
		};
		
		var createAttendanceView = function(roles) {
			var index = 0;
			var rolesList = getRolesViewModel(roles);

			createEmptyAttendanceView();

			$('.circle').each(function() {
				// Different CSS based on role
				$(this).addClass(rolesList[index]);

				// Add tooltip for 'Lead', 'Follow', 'Both'
				if (rolesList[index] !== 'empty') {
					$(this).attr('rel','tooltip');
					$(this).attr('title',getRoleLabel(rolesList[index]));
				}

				index++;
			});

			// Tooltip style
			$('.circle').tooltip({animation: false,placement: 'left'});

			// Attendance view
			var totalAttendance = roles.lead + roles.follow + roles.both;
			$('#available').html(Math.max(0, attendanceLimit - totalAttendance));

			var $attendance = $('#attendance');
			$attendance.fadeIn(250);
		};

		// Overrides for test.
		// roles.lead   = 50;
		// roles.follow = 20;
		// roles.both   = 20;

		createAttendanceView(roles);
	};

	$.get('/data/attendance/limit/', function(attendanceLimit) {
		$.get('/data/roles/', function(data) {
			showAttendance(attendanceLimit, data);
		});
	});
});