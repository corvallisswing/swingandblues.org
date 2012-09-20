$(document).ready(function() {

	var includeHeaderAndFooter = function() {
		var $body = $("body");

		$.get("/inc/header/", function(data) {
			$body.prepend(data);
			onHeaderReady();
		});

		$.get("/inc/footer/", function(data) {
			$body.append(data);		
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
	};

	includeHeaderAndFooter();
});