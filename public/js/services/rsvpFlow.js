Weekend.Services.rsvpFlow = function ($window) {

    return {
        ok: function () {
            console.log('OK!');
        },
        next: function () {
            $window.location.href = '/rsvp/next';
        }
    };
};
Weekend.Services.rsvpFlow.$inject = ['$window'];
angular.module('project').service('rsvpFlow', Weekend.Services.rsvpFlow);