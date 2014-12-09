'use strict'

function AdminRsvps(rsvps, $scope) {

    var details = [];

    $scope.getRsvp = function (id, section) {
        var rsvp = undefined;
        for (var i=0; i < rsvps.length; i++) {
            if (rsvps[i]._id === id) {
                rsvp = rsvps[i];
                break;
            }
        }

        if (section) {
            return rsvp[section];
        }
        return rsvp;
    };

    $scope.toggleDetails = function (id) {
        var index = details.indexOf(id);
        if (index < 0) {
            details.push(id);
        }
        else {
            details.splice(index, 1);
        }
    };

    $scope.isShowing = function (id) {
        if (details.indexOf(id) < 0) {
            return false;
        }
        return true;
    };
}
AdminRsvps.$inject = ['rsvps', '$scope'];
