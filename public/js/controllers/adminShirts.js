'use strict'

function AdminShirts(rsvps, $scope, $http) {

    var details = [];

    $scope.shirtType = {};
    $scope.shirtSize = {};
    $scope.shirtData = {};

    rsvps.forEach(function (rsvp) {
        $scope.shirtType[rsvp._id] = rsvp.shirt.type;
        $scope.shirtSize[rsvp._id] = rsvp.shirt.size;
    });

    $scope.setShirtType = function (type, id) {
        $scope.shirtType[id] = type;
        var body = {
            id: id,
            type: type
        };
        $http.put('/admin/data/shirt/type', body)
        .error(function (data, status) {
            console.log(data);
            console.log(status);
            $scope.shirtType[id] = "error";
        });

        updateShirtData();
    };

    $scope.setShirtSize = function (size, id) {
        $scope.shirtSize[id] = size;
        var body = {
            id: id,
            size: size
        };

        $http.put('/admin/data/shirt/size', body)
        .error(function (data, status) {
            console.log(data);
            console.log(status);
            $scope.shirtSize[id] = "error";
        });

        updateShirtData();
    };

    var updateShirtData = function () {
        $scope.shirtData = {};

        rsvps.forEach(function (rsvp) {
            var id = rsvp._id;
            if (rsvp.shirt.want) {
                var shirtSize = $scope.shirtSize[id];
                var shirtType = $scope.shirtType[id];

                if (shirtSize && shirtType) {
                    if (!$scope.shirtData[shirtType]) {
                        $scope.shirtData[shirtType] = {};
                    }

                    var shirtDataType = $scope.shirtData[shirtType];
                    if (!shirtDataType[shirtSize]) {
                        shirtDataType[shirtSize] = 0;
                    }

                    var sizeCount = shirtDataType[shirtSize];
                    sizeCount = parseInt(sizeCount, 10);
                    shirtDataType[shirtSize] = sizeCount + 1;
                }
            }
        });
    };

    updateShirtData();

    // $scope.getPanelClass = function (id) {
    //     var val = {};
    //     val[$scope.paymentStatus[id]] = true;
    //     return val;
    // };
}
AdminShirts.$inject = ['rsvps', '$scope', '$http'];