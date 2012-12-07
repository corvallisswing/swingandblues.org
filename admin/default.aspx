<!doctype html>
<html lang="en" ng-app="myApp">
<head>
  <meta charset="utf-8">
  <title>Admin</title>
  <!--#include virtual = "/inc/head-common.html" -->
  <link rel="stylesheet" href="css/app.css"/>
    <!--#include virtual = "/inc/head-analytics.aspx" -->
</head>
<body>
<!--#include virtual = "/inc/header.html" -->  
<div class="container"> 
<div class="span12">
  <h1>Administration</h1>

  <ul class="menu">
    <li><a href="/data/admin/auth/google">Login</a></li>
    <li><a href="#/view1">view1</a></li>
    <li><a href="#/view2">view2</a></li>
    <li><a href="/data/admin/auth/logout">Logout</a></li>
  </ul>

  <div ng-view></div>

  <div>Angular seed app: v<span app-version></span></div>

</div>
</div>
<!--#include virtual = "/inc/footer.html" -->  

  <!-- In production use:
  <script src="//ajax.googleapis.com/ajax/libs/angularjs/1.0.2/angular.min.js"></script>
  -->
  <script src="lib/angular/angular.js"></script>
  <script src="js/app.js"></script>
  <script src="js/services.js"></script>
  <script src="js/controllers.js"></script>
  <script src="js/filters.js"></script>
  <script src="js/directives.js"></script>
</body>
</html>


</body>
</html>
