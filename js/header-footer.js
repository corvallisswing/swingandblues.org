// var headers = function(callback) {
$(document).ready(function () {

	var highlightCurrentPage = function() {
		var $navLinks = $(".navbar a");	
		var path = window.location.pathname;		
	
		$navLinks.each(function() {
			var el = $(this);			
			if (el.attr('href') === path) {
				el.parent("li").addClass("active");
			}
		});

		$('body').trigger('actuallyReady');
		// if (callback) {
		// 	callback();
		// }
	};

	highlightCurrentPage();
});