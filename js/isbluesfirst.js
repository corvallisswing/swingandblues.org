$(document).ready(function () {
// Apply different styles if we're at bluesandswing.org
// (as opposed to swingandblues.org)

if (document.domain === "bluesandswing.org") {
	$('head').append("<link rel='stylesheet' type='text/css' href='/css/blues.css' />")
	$('#topnav').addClass('navbar-inverse');

	var eventNames = $('.eventName');
	eventNames.each(function(index, el) {		
		$(this).html('Corvallis Blues and Swing Weekend');
	});	

	var fancyEventNames = $('.fancyEventName');
	fancyEventNames.each(function(index, el) {		
		$(this).html('Blues &amp; Swing Weekend');
	});
}

});