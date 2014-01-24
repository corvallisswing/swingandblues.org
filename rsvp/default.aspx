<!doctype html>
<html lang="en" ng-app="project">
<head>
	<title>RSVP: <!--#include virtual = "/inc/event-name.aspx" --></title>	
	<meta name="description" content="Make a reservation for three nights of swing and blues dancing in Corvallis, Oregon. January 24-26."/>
	
<!--#include virtual = "/inc/head-common.html" -->
	<link rel="stylesheet" type="text/css" href="./css/style.css"/>
	<link rel="stylesheet" type="text/css" href="./css/payment.css"/>

	<script src="http://code.angularjs.org/1.0.2/angular.js"></script>
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="modernizr/modernizr.custom.28216.js"></script>

	<script src="client-1.3.1.js"></script>
	<script src="clientJquery.js"></script>
	<style>
	.container {
		width: auto;
		max-width: 940px;
	}
	</style>
<!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>
<!--#include virtual = "/inc/header.html" -->	
<div>
	<div class="container">
		<div class="span12"><h1><span class="fancyEventName">Swing &amp; Blues Weekend</span><span class="visible-desktop">, Corvallis</span></h1></div>	
		<div ng-view></div>	
	</div>
	<div class="container footer" style="padding-bottom: 0">
		<div class="license">
			Cute icons, courtesy <a href="http://www.glyphicons.com">Glyphicons</a>. 
			<a href="http://creativecommons.org/licenses/by/3.0/">CC-BY</a>.
		</div>
	</div>
<!--#include virtual = "/inc/footer.html" -->	
</div>
</body>
</html>