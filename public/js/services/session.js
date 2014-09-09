'use strict'

Weekend.Services.session = function (rsvp) {
    // session: use localStorage to maintain session
    // state across visits to the page and refreshes.

    // TODO: 'today' should be injected, if it can.
    var today = new Date();
    var sessionKey = 'swing-and-blues-weekend-2015-session';

    var getExpirationDate = function (today) {
        // expire in 12 hours. 
        // 
        // The purpose of the session is to let us 
        // bounce around the site, and refresh the 
        // page, without worrying too much. 
        // 
        // In other words, most of the data we're
        // keeping track of in the session will 
        // be irrelevant in 12 hours, anyway.
        // 
        var expirationDate = new Date();
        expirationDate.setHours(today.getHours() + 12);
        return expirationDate;
    };

    var defaultSession = function() {
        return rsvp;
    }(); // closure

    var getSession = function() {
        var session = store.get(sessionKey);

        if (!session) {
            return session;
        }
        // Dates are stored as strings in JSON. That's cool,
        // but we want to have actual Date objects.
        if (session.expirationDate) {
            session.expirationDate = new Date(session.expirationDate);
        }

        return session;
    };

    var session = getSession();
    if (!session || !session.expirationDate) {
        // Load the default session if we don't have
        // one in the local store 
        session = defaultSession;
    }
    else if (session.expirationDate < today) {
        // the session is expired?
        session.isExpired = true;           
    }
    else {
        // There is a non-stale session in local storage,
        // so let's refresh the expiration date.
        // TODO: Is this dumb? Should there be a 
        // set time where we always clear out the
        // session data?
        session.expirationDate = getExpirationDate(today);
    }

    // Reset our session if we've expired
    if (session.isExpired) {
        session = defaultSession;
        session.expirationDate = getExpirationDate(today);
    }

    var maybeSave = function (sess) {
        if (store.enabled) {
            store.set(sessionKey, session);    
        }
        else {
            console.log("Session not saved, as local storage is not available.")
        }
    };

    // Add our functions back, since JSON.stringify stripped them out.    
    session.save = function() {
        var now = new Date();
        session.isExpired = undefined;
        session.expirationDate = getExpirationDate(now);
        maybeSave(session);
    };

    session.expire = function() {
        session.isExpired = true;
        maybeSave(session);
    };

    // ensure default properties
    for (var prop in rsvp) {
        if (!session[prop]) {
            session[prop] = rsvp[prop];
        }
    }

    return session;
};
Weekend.Services.session.$inject = ['rsvp'];
angular.module('project').service('session', Weekend.Services.session);