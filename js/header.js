var headers = function(callback) {

	var includeHeader = function() {
		var $body = $("body");

		$.get("/inc/header/", function(data) {
			$body.prepend(data);
			onHeaderReady();
		});
	};

	var onHeaderReady = function() {
		var $navLinks = $(".navbar a");	
		var path = window.location.pathname;		
	
		$navLinks.each(function() {
			var el = $(this);			
			if (el.attr('href') === path) {
				el.parent("li").addClass("active");
			}
		});

		if (callback) {
			callback();
		}
	};

	includeHeader();
};