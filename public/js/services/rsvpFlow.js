// A basic flow graph for the RSVP workflow
Weekend.Services.rsvpFlow = function ($window) {

    var currentScreenName = 'start';

    var screens = {
        'start': {
            name: 'start',
            next: 'choose-your-adventure',
            url: '/rsvp'
        },
        'choose-your-adventure': {
            name: 'choose-your-adventure',
            next: 'food',
            url: '/rsvp/choose-your-adventure'
        },
        'food': {
            name: 'food',
            next: 'finish',
            url: '/rsvp/food'
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

    var next = function () {
        var msg;
        var current = screens[currentScreenName];
        var next = screens[current.next];
        
        if (!next) {
            msg = "No next edge from screen: " + currentScreenName;
            throw new Error(msg);
        }

        var url = next.url;
        if (!url) {
            msg = "No url associated with screen: " + next;
            throw new Error(msg);
        }

        $window.location.href = url;
    };

    return {
        setScreen: setScreen,
        screens: screens,
        next: next
    };
};
Weekend.Services.rsvpFlow.$inject = ['$window'];
angular.module('project').service('rsvpFlow', Weekend.Services.rsvpFlow);