var express = require('express');
var events  = require('events');
var http    = require('http');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index'); 
var rsvp   = require('./routes/rsvp-routes');
var admin  = require('./routes/admin');
var authRouter = require('./routes/auth');
var payments = require('./routes/payments');


var errors = require('./routes/lib/errors.js');
var settings = require('./routes/lib/settings');
var auth    = require('./routes/lib/auth.js');
var sslServer = require('./routes/lib/https-server.js');

var session = require('express-session');
var couchSessionStore = require('./routes/lib/couch-session-store.js');

var ee = new events.EventEmitter();
var isReady = false;

var app = express();

// config
app.set('port', process.env.PORT || 3000);
app.set('ssl-port', process.env.SSL_PORT || 4000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// TODO: This fails if the first request to the
// server is not a domain backed by our cert.
app.use(canonicalDomain);
app.use(forceHttps);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(auth.firstRun);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

function forceHttps(req, res, next) {
    if (!sslServer.isRunning()) {
        // Don't do anything if we can't do anything.
        return next();
    }

    if(req.secure 
        || req.headers['x-forwarded-proto'] === 'https' 
        || req.host === "localhost") {
        return next();  
    }
    res.redirect('https://' + req.get('Host') + req.url);
};

function canonicalDomain(req, res, next) {
    var settings = app.get('settings');
    if (!settings) {
        return next();
    }

    var domainName = undefined;
    if (settings['domain-name'] && settings['domain-name'].value) {
        domainName = settings['domain-name'].value.trim();
    }

    if (!domainName || req.host === domainName) {
        return next();
    }

    var hostAndPort = req.get('Host');
    var redirectToHost = domainName;
    if (hostAndPort) {
        redirectToHost = hostAndPort.replace(req.host, domainName);
    }

    var url = req.protocol + "://" + redirectToHost + req.originalUrl;
    res.redirect(301, url);
};

var handleErrors = function () {
    // catch 404 and forward to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    // error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            if (res.headersSent) {
                errors.log(err);
            }
            else {
                res.status(err.status || 500);
                res.render('error', {
                    message: err.message,
                    error: err
                });    
            }
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        if (res.headersSent) {
            errors.log(err);
        }
        else {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: {}
            });    
        }
    });
};


//-------------------------------------------------------
// Initialization
//
var appSettings = function (req, res, next) {
    if (!app.get('settings')) {
        settings.getAll(function (err, settingsData) {
            if (err) {
                errors.log(err);
                return next();
            }
            app.set('settings', settingsData);
            next();
        });
    }
    else {
        next();
    }
};

var getCookieSettings = function () {
    // TODO: Check settings to guess if https is running.
    // Or actually figure out if https is running, and if so
    // use secure cookies
    var oneHour = 3600000;
    var oneDay = 24 * oneHour;
    var fourDays = 4 * oneDay;
    var cookieSettings = {
        path: '/',
        httpOnly: true,
        secure: false,
        maxAge: fourDays
    };

    return cookieSettings;
};


var init = function () {
    var appLocals = function (req, res, next) {
        app.locals.host = req.get('Host');
        app.locals.baseUrl = req.protocol + '://' + req.get('Host');
        next();
    };

    var handleRoutes = function () {
        app.use('/', routes);
        app.use('/rsvp', rsvp);
        app.use('/payments', payments);
        app.use('/admin', admin);
        app.use('/auth', authRouter);
    };

    var initSettingsOk = function (settings) {
        var sessionSecret = settings['session-secret'].value;
        var SessionStore = couchSessionStore(session);
        var cookieSettings = getCookieSettings();
        app.use(session({ 
            store: new SessionStore(),
            secret: sessionSecret,
            cookie: cookieSettings
        }));

        // Passport / Auth 
        if (settings["admin-access-list"]) {
            auth.setAccessList(settings["admin-access-list"].value);
        }
        auth.attach(app);

        // Load settings into app object
        app.use(appSettings);
        app.use(appLocals);

        var gaId = settings['google-analytics'].value; 
        app.locals.analyticsId = gaId || 'UA-12425420-2';

        handleRoutes();
        handleErrors();

        ready();
    };

    settings.init(function (err, settings) {
        if (err) {
            // Fatal
            return errors.log(err);
        }
        initSettingsOk(settings);
    });
}(); // <-- call now

var tryToCreateHttpsServer = function (callback) {
    sslServer.create(app, callback);
};

//-------------------------------------------------------
// exports
//
var startServer = function () {
    http.createServer(app).listen(app.get('port'), function () {
        console.log("http server listening on port " + app.get('port'));
    });
        
    // Run an https server if we can.
    sslServer.create(app, app.get('ssl-port'), function (err, message) {
        if (err) {
            return console.log(err);
        }
        console.log(message);
    });
};

function ready() {
    isReady = true;
    ee.emit('circle-blvd-app-is-ready');
}

exports.whenReady = function (callback) {
    if (isReady) {
        return callback();
    }
    ee.once('circle-blvd-app-is-ready', function () {
        callback();
    });
};

exports.express = app;
exports.startServer = startServer;