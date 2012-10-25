$(document).ready(function () {
// Apply different styles if we're at bluesandswing.org
// (as opposed to swingandblues.org)

if (document.domain === "bluesandswing.org") {
	$('head').append("<link rel='stylesheet' type='text/css' href='/css/blues.css' />")
	$('#topnav').addClass('navbar-inverse');
}

});