<!doctype html>
<html lang="en" ng-app="project">
<head>
	<title>Guests: <!--#include virtual = "/inc/event-name.aspx" --></title>	
	<meta name="description" content="Helpful information for weekend guests."/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!--#include virtual = "/inc/head-common.html" -->

<!-- 	<link href="/css/bootstrap-responsive.min.css" rel="stylesheet">
 -->
	<link rel="stylesheet" type="text/css" href="/rsvp/css/style.css"/>
	<link rel="stylesheet" type="text/css" href="/rsvp/css/payment.css"/>
	<link rel="stylesheet" type="text/css" href="/css/guests.css"/>

	<script src="http://code.angularjs.org/1.0.2/angular.js"></script>
	<script src="/rsvp/bootstrap/js/bootstrap.min.js"></script>
	<script src="/rsvp/modernizr/modernizr.custom.28216.js"></script>

	<script src="client-1.2.js"></script>
	<script src="clientJquery.js"></script>

	<style>
.container {
	margin: 0 !important;
	margin-top: 1ex !important;
	padding: 3ex;
	max-width: 940px;
	width: auto;
}

h5 {
	margin-bottom: 0;
	margin-top: 1.5em;
}
ul {
	margin-bottom: 0;
}

	</style>

<!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>
<div id="topnav" class="navbar" style="margin-bottom: 0">
	<div class="navbar-inner square">		
		<ul class="nav">
			<li><a class="brand" href="/">&#9834;</a></li>
			<li><a href="/guests/#/">At a glance</a></li>
			<li><a href="/guests/#/food">Food</a></li> 
			<li><a href="/guests/#/volunteers">Volunteers</a></li> 			
		</ul>
	</div>
</div>
	
<div>
	<div class="container">
		<div ng-view></div>	
	</div>
<!--#include virtual = "/inc/footer.html" -->	
</div>
</body>
</html>