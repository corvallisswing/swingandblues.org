// A basic flow graph for the survey workflow
Weekend.Services.surveyFlow = function ($http, $window) {
    var currentScreenName = 'start';

    var screens = {
        'start': {
            name: 'start',
            next: 'things',
            url: '/survey'
        },
        'things': {
            name: 'things',
            next: 'music',
            url: '/survey/things'
        },
        'music': {
            name: 'music',
            next: 'thanks',
            url: '/survey/music'
        },
        'thanks': {
            name: 'thanks',
            url: '/survey/thanks'
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

    var next = function (survey) {
        var msg;
        var current = screens[currentScreenName];
        var next;
        // Let us use a fn() or a name to specify
        // where to go next.
        if (typeof current.next === 'function') {
            next = screens[current.next(survey)];
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

    var submit = function (survey, callback) {
        $http.put('/survey/data/', survey)
        .success(function () {
            $http.post('/survey/data/submit', survey)
            .success(function () {
                if (callback) {
                    callback();    
                }
            });
        });
    };

    var startOver = function (callback) {
        $http.get('/survey/data/reset')
        .success(function (data, status) {
            $window.location.href = '/survey';
        });
    };

    return {
        startOver: startOver,
        setScreen: setScreen,
        screens: screens,
        next: next,
        submit: submit,
        goTo: goTo
    };
};
Weekend.Services.surveyFlow.$inject = ['$http', '$window'];
angular.module('project').service('surveyFlow', Weekend.Services.surveyFlow);