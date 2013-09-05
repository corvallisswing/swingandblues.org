<!doctype html>
<html lang="en">
<head>
	<title><!--#include virtual = "/inc/event-name.aspx" --></title>
	<meta name="description" content="January 24-26, 2014. Three nights of swing and blues dancing in the heart of the Willamette Valley. We are proud to bring together two swing bands, two blues bands and our award-winning DJs, for a weekend of fun, great music, and social dancing."/>

<!--#include virtual = "/inc/head-common.html" -->

	<link rel="stylesheet" type="text/css" href="/css/home.css"/>
	<script src="/js/home.js"></script>
	<script src="http://d3js.org/d3.v3.js" charset="utf-8"></script>
	<script src="/js/survey.js"></script>

	<style>
	.day {
		/*margin-top: 2em;*/
		/*clear: left;*/
	}

	.container {
/*		padding: 0;
		padding-top: 1em;
*/	}

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

<div class="container">	
 	<div id="homeBanner" class="swingEvent firstEvent" style="padding-bottom: 1em; margin-bottom: -2em">
 		<div id="thanks">
			<h4>&quot;How does doing this again, next year, sound?&quot;</h4>
			<div id="chart"></div>

			<h4>Save the date.</h4>
			<h4>January 24-26, 2014. <strong>Corvallis, Oregon</strong>.</h4>

		</div>

		<div class="row-fluid">
			<img id="logo" class="pull-right" src="/img/swing-logo-black.png" style="width: 75px;" width="75" height="75" />
		</div>
	</div>
	<!-- <h1 class="fancyEventName">Corvallis Swing &amp; Blues Weekend</h1> -->
	<!-- <div class="bluesEvent firstEvent" 
	style="padding: 1em; padding-left: 0; padding-right: 2.5em; text-align: center; margin-bottom: -3em">&#9834;</div> -->
</div>

<!-- 	<div id="attendance">
		<div id="label"><a href="/rsvp/">Reservations remaining</a>: <span id="available"></span></div>
	</div>
	<div id="homeBanner">
		<img id="logo" src="/img/swing-logo-black.png" height="300" width="300"/>	
			<h1 class="date">January 25&ndash;27th</h1>
			<h2 class="city">Corvallis, Oregon</h2>
		</div>
	</div> -->
<!--#include virtual = "/inc/footer.html" -->	
</body>
</html>