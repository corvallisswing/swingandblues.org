'use strict'

function AdminSettings(settings, $scope, $http) {
    $scope.settings = {};
    for (var key in settings) {
        $scope.settings[key] = settings[key].value;
    }

    $scope.saveSetting = function (name) {
        var setting = settings[name];
        setting.value = $scope.settings[name];

        $http.put('/admin/data/setting', setting)
        .success(function (data, status) {
            console.log("Save passed: " + name);    
        })
        .error(function (data, status) {
            console.log("Save failed: ");
            console.log(data);
        });
    };
}
AdminSettings.$inject = ['settings', '$scope', '$http'];

