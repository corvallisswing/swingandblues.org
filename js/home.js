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
});