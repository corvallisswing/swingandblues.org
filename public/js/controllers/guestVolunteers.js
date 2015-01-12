function VolunteersCtrl($scope, $window, $http, params) {
    $scope.name = undefined;
    $scope.exactly = undefined;

    var showSchedule = function (name, exactly) {
        if (name) {
            $scope.name = name; 
        }
        $scope.exactly = exactly;
        
        var friday = [];
        var saturday = [];
        var sunday = [];
        var personList = {};

        var requestUrl = '/guests/data/volunteers/shifts/' + name;
        if (exactly) {
            requestUrl += '/' + exactly;
        }

        $http.get(requestUrl)
        .success(function (data) {
            for (var key in data) {
                var entry = data[key];
                if (entry.day === "Friday") {
                    friday.push(entry);
                }
                if (entry.day === "Saturday") {
                    saturday.push(entry);
                }
                if (entry.day === "Sunday") {
                    sunday.push(entry);
                }

                // for name conflicts
                personList[entry.person] = entry.person;
            }

            // do we have name conflicts?
            $scope.personList = personList;
            $scope.personCount = 0;
            for (var person in personList) {
                $scope.personCount++;
            }

            $scope.friday = friday;
            $scope.saturday = saturday;
            $scope.sunday = sunday;
        });
    };



    $scope.showSchedule = function(name, exactly) {
        var path; 
        if (name && name !== undefined) {
            path = "/guests/volunteers/" + name
            if (exactly && exactly !== undefined) {
                path += '/' + exactly;
            }
        }

        if (path) {
            $window.location.href = path;
        }
    };

    if (params.who) {
        $scope.volunteer = {};
        $scope.volunteer.name = params.who;
        showSchedule(params.who, params.exactly);
    }
}
VolunteersCtrl.$inject = ['$scope', '$window', '$http', 'params'];
