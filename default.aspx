<!doctype html>
<html lang="en">
<head>
	<title><!--#include virtual = "/inc/event-name.aspx" --></title>
	<meta name="description" content="January 24-26, 2014. Three nights of swing and blues dancing in the heart of the Willamette Valley. We are proud to bring together two swing bands, two blues bands and our award-winning DJs, for a weekend of fun, great music, and social dancing."/>

<!--#include virtual = "/inc/head-common.html" -->

	<link rel="stylesheet" type="text/css" href="/css/home1.1.css"/>
	<script src="/js/home.js"></script>
	<script src="/js/survey.js"></script>

	<style>
	.navbar, .navbar-inner {
		background: #eee;
	}

	.firstEvent {
		border-top: 0 !important;
	}

	.swingEvent, .bluesEvent {
		margin: 0;
		border: 0;
		border-top: 1px #882 dotted;
		
		padding: 4.5em;
		padding-top: 1em;
		padding-bottom: 3em;
		margin-left: -3em;
		margin-right: -6em;
	}

	.swingEvent {		

	}

	.bluesEvent {
		color: #888;
		color: #333;
		background: #222;
		background: #eee;
		
		clear: left;
	}

	.bluesEvent h4 {
		color: #222;	
	}

	.lastEvent {
		border-bottom: double 3px #772;		
	}

	.info {
		font-weight: bold;
	}

	.photoCredit {
		font-size: 8pt;
		text-align: right;
	}

	#logo, #thanks, #topHeader {
		padding-left: 0; 
		padding-right: 2.5em;
		padding-top: 0;
		padding-bottom: 0;
	}

	#thanks {
		margin-top: 2em;
	}

	h4 {
		font-weight: normal;
	}
	</style>


<!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>
<!--#include virtual = "/inc/header.html" -->	

<div style="background: black; 
	padding-top: 2em;
	position: relative;
	right: 0;">

	<div id="attendance" style="z-index: 9; position: absolute; top: 0; right: 1em">
		<div id="label"><a href="/rsvp/" style="font-weight: normal">Reservations remaining</a>: <span id="available"></span></div>
	</div>

	<h1 class="fancyEventName" style="color: #aaa">Corvallis Swing &amp; Blues Weekend</h1>
	<h2 class="date" style="color: #777; z-index: 11; position: relative">
		January 24&ndash;26th. 
		<a href="/rsvp/" style="color: #772">R.S.V.P.</a></h2>
	<div>
		<img src="img/weekendOpen.jpg" style="display: block; margin: auto"/>
	</div>
</div>

<!--#include virtual = "/inc/footer.html" -->	
</body>
</html>