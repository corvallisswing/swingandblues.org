var express = require('express');
var events  = require('events');
var http    = require('http');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index'); 
var rsvp   = require('./routes/rsvp');

var errors = require('./routes/lib/errors.js');
var settings = require('./routes/lib/settings');

var ee = new events.EventEmitter();
var isReady = false;

var app = express();

// config
app.set('port', process.env.PORT || 3000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/rsvp', rsvp);

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
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


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


var init = function () {
    var initSettingsOk = function (settings) {
        app.use(appSettings);
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


//-------------------------------------------------------
// exports
//
var startServer = function () {
    http.createServer(app).listen(app.get('port'), function () {
        console.log("http server listening on port " + app.get('port'));
    });
        
    // // Run an https server if we can.
    // tryToCreateHttpsServer(function (err, success) {
    //     if (err) {
    //         console.log(err);
    //     }
    //     else {
    //         console.log(success);
    //     }
    // });
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