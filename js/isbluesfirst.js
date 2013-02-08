var setupBlues = function () {
	// Apply different styles if we're at bluesandswing.org
	// (as opposed to swingandblues.org)

	if (document.domain === "bluesandswing.org") {
		$('#topnav').addClass('navbar-inverse');
		$('#logo').attr('src', '/img/swing-logo-gray.png');
		$('#surveyLogo').attr('src', '/img/weekend-logo-survey-gray.png');

		var eventNames = $('.eventName');
		eventNames.each(function(index, el) {		
			$(this).html('Corvallis Blues and Swing Weekend');
		});	

		var fancyEventNames = $('.fancyEventName');
		fancyEventNames.each(function(index, el) {		
			$(this).html('Blues &amp; Swing Weekend');
		});
	}
};


// TODO: This condition is lame. Fix it, future-self.
if (typeof __usingAngular === "undefined") {
	$(document).ready(setupBlues);
}
else {
	// Do nothing! I guess. The Angular code
	// will call 'setupBlues' elsewhere.	
}