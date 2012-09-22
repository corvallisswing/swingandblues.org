swingandblues.org
=================

The website at http://swingandblues.org

Prerequisits
=================
* <a href="http://nodejs.org/">Node.js</a> 0.8.x
* <a href="https://github.com/tjanczuk/iisnode">iisnode</a>
* CouchDB 1.2
* IIS server-side includes

Deployment
=================
To deploy:
	0. Have an IIS site.
	1. Give the IIS app pool for the site read/write permission to /rsvp/submit.
	2. Copy your Amazon SMTP credentials into /rsvp/submit/server.js
