<!doctype html>
<html lang="en">
<head>
	<title><!--#include virtual = "/inc/event-name.aspx" --></title>
	<meta name="description" content="January 24-26, 2014. Three nights of swing and blues dancing in the heart of the Willamette Valley. We are proud to bring together two swing bands, two blues bands and our award-winning DJs, for a weekend of fun, great music, and social dancing."/>

<!--#include virtual = "/inc/head-common.html" -->

	<link rel="stylesheet" type="text/css" href="/css/home1.2.css"/>
	<script src="/js/home1.1.js"></script>
	<script src="/js/survey.js"></script>

	<style>
	.navbar {
		position: relative;
		margin-left: 2em;
		margin: auto;
		max-width: 940px;
	}
	.navbar, .navbar-inner {
		background: #222;
		border-color: #222;
	}
	.active, .brand {
		color: #eee !important;
		background-color: #222 !important;
	}
	.navbar .nav>.active>a, .navbar .nav>.active>a:hover, .navbar .nav>.active>a:focus {
		background-color: #333;
		color: #888;
		-webkit-box-shadow: none;
	}
	.navbar .nav > li > a {
		text-shadow: rgb(0,0,0) 0px 0px 0px;
		text-decoration: none;
	}
	.navbar .nav > li > a:hover {
		color: #eee;
	}
	a#rsvpLink:hover {
		color: #aa4 !important;
		text-decoration: underline;
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

	h2.home {
		margin-top: 0;
		color: #999;

		font-family: 'Petit Formal Script', sans-serif;	
		font-size: 14pt;
		font-weight: normal;
		
		text-align: center;
	}

	.date {
		font-size: 14pt;
	}

	.live-music img {

	}

	.text, .band {
		float: left;
		margin-left: 20px;

		max-width: 460px;
		min-height: 1px;
	}

	.band {
		padding-top: 10px;
		padding-left: 18px;
		padding-right: 17px;
		background: #222;
		margin-bottom: 2.5em;
		border: 0;

		text-align: center;
	}
	.band img {
		margin: auto;
		text-align: center;
	}

	.name {
		color: #888;
		margin-top: 0.8em;
		margin-bottom: 1.4em;

		font-family: 'Petit Formal Script', sans-serif;	
		font-size: 14pt;
		font-weight: normal;

		text-align: center;
	}
	.row {

	}
	.container {
		padding: 0;
		padding-left: 1em;
		padding-right: 1em;
		-webkit-box-shadow: none;
		box-shadow: none;
		max-width: 940px;
		width: auto;
	}

	ol, li, p, .fin {
		color: #aaa;
	}
	p {
		margin-top: 1.4em;
		line-height: 1.25em;
	}
	.fin {
		text-align: center;
		margin-bottom: 3em;
	}

	.thanks {
		font-family: 'Petit Formal Script', sans-serif;	
		color: #aaa;
		text-align: right;
	}
	</style>


<!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>

<div class="container" style="background-color: black; border: none">
	<div class="live-music" style="
		margin: auto">
		
		<div class="row">
			<img src="/img/weekend-dancer-black-wide.jpg"/>
			<p class="max4 thanks">Thank you.</p>
		</div>
		<div class="row">
			<p style="text-align: center" class="thanks">Please take our <a href="/rsvp/#/survey/">guest survey</a>.</p>
		</div>
</div>

<!--#include virtual = "/inc/footer.html" -->
</body>
</html>