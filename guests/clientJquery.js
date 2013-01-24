
var main = function() {
	highlightCurrentPage();
};

var highlightCurrentPage = function() {
	var $navLinks = $(".navbar a");	
	var path = window.location.pathname + window.location.hash;
	console.log(path);
	
	$navLinks.each(function() {
		var el = $(this);			
		if (el.attr('href') === path) {
			el.parent("li").addClass("active");
		}
		else {
			el.parent("li").removeClass("active");
		}
	});
};

