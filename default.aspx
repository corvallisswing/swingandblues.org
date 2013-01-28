<!doctype html>
<html lang="en">
<head>
	<title><!--#include virtual = "/inc/event-name.aspx" --></title>
	<meta name="description" content="January 25-27, 2013. Three nights of swing and blues dancing in the heart of the Willamette Valley. We are proud to bring together two swing bands, two blues bands and our award-winning DJs, for a weekend of fun, great music, and social dancing."/>

<!--#include virtual = "/inc/head-common.html" -->

	<link rel="stylesheet" type="text/css" href="/css/home.css"/>
	<script src="/js/home.js"></script>

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

	</style>


<!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>
<!--#include virtual = "/inc/header.html" -->	

<div class="container">	
	<div class="span12">
		<h1>Sunday, January 27th</h1>
	</div>
	<div class="swingEvent firstEvent" style="padding-bottom: 1em">
		<div class="row-fluid">
			<h4>Afternoon</h4>
			<p>We'll be taking over Old World Deli in the afternoon with casual dancing in a relaxed atmosphere. Come get some lunch and hang out with your old and new friends.</p>
	
			<div>
				<div><span class="info">Dance:</span> 1 - 4 p.m.</div>
				<div><span class="info">Venue:</span> Old World Deli</div>
				<div><span class="info">Address:</span> 341 SW 2nd St, Corvallis</div>
				<div><span class="info">Cover:</span> None</div>
			</div>
		</div>
	</div>

	<div class="bluesEvent lastEvent" style="padding-bottom: 1em">
		<div class="row-fluid">
			<div class="span4">
				<h4>Evening</h4>
				<p>We'll be on the main stage in the Majestic auditorium for our final night in town, dancing to swing, blues, and music that just makes you move, going until midnight.</p>

				<div><span class="info">Dance:</span> 8 p.m. -  midnight</div>
				<div><span class="info">Venue:</span> Majestic Theatre</div>
				<div><span class="info">Address:</span> 115 SW 2nd St, Corvallis | <a href="http://goo.gl/maps/OZEIT">Map</a></div>
				<div><span class="info">Cover:</span> $8</div>
			</div>
			<div class="span8">
				<img class="img-polaroid" src="/img/stage.jpg" 
					style="margin-top: 0.7em"/>
				<div class="photoCredit">Photo credit: The Majestic Theatre</div>
			</div>
		</div>
	</div>
	<div class="bluesEvent firstEvent" 
	style="padding: 1em; padding-left: 0; padding-right: 2.5em; text-align: center; margin-bottom: -3em">&#9834;</div>
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