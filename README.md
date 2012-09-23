swingandblues.org
=================

The website at http://swingandblues.org

Prerequisites
=================
* <a href="http://nodejs.org/">Node.js</a> 0.8.x
* <a href="https://github.com/tjanczuk/iisnode">iisnode</a>
* CouchDB 1.2
* IIS server-side includes

Deployment
=================
To deploy:
1. Have an IIS site.
2. Install the prerequisites.
3. Give the IIS app pool for the site read/write permission to /rsvp/submit.
4. Copy your Amazon SMTP credentials into /rsvp/submit/server.js
