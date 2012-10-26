<!doctype html>
<html lang="en" ng-app="project">
<head>
	<title>RSVP: <!-- #include virtual = "/inc/event-name.html" --></title>	
	<meta name="description" content="Make a reservation for three nights of swing and blues dancing in Corvallis, Oregon. January 25-27."/>
	
<!-- #include virtual = "/inc/head-common.html" -->
	<link rel="stylesheet" type="text/css" href="./css/style.css"/>
	<link rel="stylesheet" type="text/css" href="./css/payment.css"/>

	<script src="http://code.angularjs.org/1.0.2/angular.js"></script>
	<script src="http://code.angularjs.org/1.0.2/angular-resource.js"></script>
	<script src="bootstrap/js/bootstrap.min.js"></script>
	<script src="modernizr/modernizr.custom.28216.js"></script>

	<script src="placeholder.js"></script>
	<script src="client.js"></script>
	<script src="clientJquery.js"></script>

<!-- #include virtual = "/inc/head-analytics.html" -->
</head>
<body>
<!-- #include virtual = "/inc/header.html" -->	
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
<!-- #include virtual = "/inc/footer.html" -->	
</div>
</body>
</html>