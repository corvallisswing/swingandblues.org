// A basic flow graph for the RSVP workflow
Weekend.Services.rsvpFlow = function ($http, $window) {

    var currentScreenName = 'start';

    var screens = {
        'start': {
            name: 'start',
            next: 'choose-your-adventure',
            url: '/rsvp'
        },
        'choose-your-adventure': {
            name: 'choose-your-adventure',
            next: function (rsvp) {
                if (rsvp.person.isResident) {
                    return 'food';
                }
                return 'travel';
            },
            url: '/rsvp/choose-your-adventure'
        },
        'travel': {
            name: 'travel',
            next: 'food',
            url: '/rsvp/travel'
        },
        'food': {
            name: 'food',
            next: function (rsvp) {
                if (rsvp.hosting.want) {
                    return 'hosting';
                }
                return 'payment';
            },
            url: '/rsvp/food'
        },
        'hosting': {
            name: 'hosting',
            next: 'payment',
            url: '/rsvp/hosting'
        },
        'payment': {
            name: 'payment',
            next: function (rsvp) {
                if (rsvp.payment.method === 'card') {
                    // People paying with cards have already paid.
                    return 'paid';
                }
                return 'thanks';
            },
            url: '/rsvp/payment'
        },
        'thanks': {
            name: 'thanks',
            url: '/rsvp/thanks'
        },
        'paid': {
            name: 'paid',
            url: '/rsvp/paid'
        },
        'declined': {
            name: 'declined',
            url: '/rsvp/declined'
        }
    };

    var setScreen = function (newScreen) {
        var msg;
        if (!newScreen || !newScreen.name) {
            msg = "Invalid obj passed to setScreen. Needs name property.";
            throw new Error(msg);
        }

        if (!screens[newScreen.name]) {
            msg = "Attempted to set unknown screen: " + newScreen.name;
            throw new Error(msg);
        }
        currentScreenName = newScreen.name;
    };

    var next = function (rsvp) {
        var msg;
        var current = screens[currentScreenName];
        var next;
        // Let us use a fn() or a name to specify
        // where to go next.
        if (typeof current.next === 'function') {
            next = screens[current.next(rsvp)];
        }
        else {
            next = screens[current.next];            
        }
        
        if (!next) {
            msg = "No next edge from screen: " + currentScreenName;
            throw new Error(msg);
        }

        var url;
        if (typeof next === 'function') {

        }

        var url = next.url;
        if (!url) {
            msg = "No url associated with screen: " + next;
            throw new Error(msg);
        }

        $window.location.href = url;
    };

    var goTo = function (newScreen) {
        var s = newScreen;
        if (!s || !s.name || !s.url) {
            throw new Error("Invalid obj passed to goTo: " + newScreen);
        }

        $window.location.href = s.url;
    };

    var submit = function (session, callback) {
        $http.put('/rsvp/data/session', session)
        .success(function () {
            $http.post('/rsvp/data/submit')
            .success(function () {
                if (callback) {
                    callback();    
                }
            });
        });
    };

    var startOver = function (callback) {
        $http.get('/rsvp/data/reset')
        .success(function (data, status) {
            $window.location.href = '/rsvp';
        });
    };

    return {
        setScreen: setScreen,
        screens: screens,
        startOver: startOver,
        next: next,
        submit: submit,
        goTo: goTo
    };
};
Weekend.Services.rsvpFlow.$inject = ['$http', '$window'];
angular.module('project').service('rsvpFlow', Weekend.Services.rsvpFlow);