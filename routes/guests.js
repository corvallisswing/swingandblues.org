var tabletop = require('tabletop');
var mkdirp   = require('mkdirp');
var fs       = require('fs');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('guests');
});

router.get('/volunteers', function (req, res) {
    res.render('guests-volunteers');
});

router.get('/volunteers/:name', function (req, res) {
    res.render('guests-volunteers', {
        params: {
            who: req.params.name,
        }
    });
});

router.get('/volunteers/:name/:exactly', function (req, res) {
    res.render('guests-volunteers', {
        params: {
            who: req.params.name,
            exactly: req.params.exactly
        }
    });
});

//----------------------------------------------------------------
// Data: Spreadsheet-backed stuff
//----------------------------------------------------------------
router.get('/data/volunteers/shifts/update', function (req, res) {
    var sheetKeySetting = app.get('settings')['volunteer-sheet-key'];
    var volunteerScheduleSheetKey = undefined;

    if (sheetKeySetting) {
        volunteerScheduleSheetKey = sheetKeySetting.value;
    }
    console.log(volunteerScheduleSheetKey);
    var volunteerAssignments = {};

    var sheets = ['Friday', 'Saturday', 'Sunday'];
    var processSheetData = function (data, tabletop) {

        for (var sheetName in sheets) {
            var dayName = sheets[sheetName];
            var assignments = data[dayName].elements;
            for (var key in assignments) {
                var assignment = assignments[key];
                var fullName = assignment.person = assignment.person.trim();
                var firstName = fullName.split(' ')[0].toLowerCase();

                assignments[key].day = dayName;
                assignments[key].name = firstName;

                if (!volunteerAssignments[firstName]) {
                    volunteerAssignments[firstName] = [];
                }

                volunteerAssignments[firstName].push(assignment);
            }   
        }

        mkdirp('data', function (err) {
            if (err) {
                console.log(err);
                res.send(500);
                return;
            }

            fs.writeFile('data/volunteerSchedule.json', JSON.stringify(volunteerAssignments), function (err) {
                if (err) {
                    console.log(err);
                    res.send(500);
                }
                else {
                    res.send(200, "The data has been updated. Thanks!");
                }
            });
        });
    }

    tabletop.init({ 
        key: volunteerScheduleSheetKey,
        callback: processSheetData  
    });
});

router.get('/data/volunteers/shifts/', function (req, res) {
    res.send(200);
})

var getVolunteerShifts = function (name, callback) {
    var volunteerName = name.toLowerCase();
    fs.readFile('data/volunteerSchedule.json', 'utf8', function (err, data) {
        data = JSON.parse(data);
        callback(data[volunteerName]);
    });
};

router.get('/data/volunteers/shifts/:volunteerName', function (req, res) {
    var volunteerName = req.params.volunteerName.toLowerCase();
    getVolunteerShifts(volunteerName, function (data) {
        res.send(200, data);
    });
});

router.get('/data/volunteers/shifts/:volunteerName/:personName', function (req, res) {
    var volunteerName = req.params.volunteerName.toLowerCase();
    var personName = req.params.personName;

    getVolunteerShifts(volunteerName, function (data) {
        var filteredData = [];
        for (var entry in data) {
            if (data[entry].person === personName) {
                filteredData.push(data[entry]);
            }
        }
        res.send(200, filteredData);
    });
});

module.exports = function () {
    return {
        router: function (a) {
            app = a;
            return router;
        }
    }
}(); // closure