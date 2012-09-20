var main = function () {
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
	// $('#logoImage').load(handleResize);

	// With using Angular, now we just call this directly.
	handleResize();
	logo.css('display','block');
};