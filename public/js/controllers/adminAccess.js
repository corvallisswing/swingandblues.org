'use strict'

function AdminAccess(settings, $scope, $http) {
    var list = settings['admin-access-list'].value;

    var text = "";
    list.forEach(function (line) {
        text += line + '\n';
    });

    $scope.accessListText = text;

    $scope.saveAccessList = function () {
        var text = $scope.accessListText;

        var validLines = [];
        var lines = text.split('\n');
        console.log(lines);

        lines.forEach(function (line) {
            line = line.trim();
            if (line && line.length > 0) {
                validLines.push(line);
            }
        });

        var setting = settings['admin-access-list'];
        setting.value = validLines;

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
AdminAccess.$inject = ['settings', '$scope', '$http'];
