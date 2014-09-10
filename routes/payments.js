var express = require('express');
var router = express.Router();

var db = require('./lib/data/payments');

// This URL is specified in our Paypal account. It receives
// a JSON object for every payment to our account, not just
// weekend payments.
router.post('/paypal/', function (req, res) {    
    console.log("PAYPAL NOTIFICATION:");
    console.log(req.body);

    var paypal = req.body;
    // AQUACQJZJ5CDQ: Weekend pass
    // G8GANEEDRWNUY: Weekend pass and shirt
    var weekendItemNumbers = ['AQUACQJZJ5CDQ', 'G8GANEEDRWNUY'];
    var shirtItemNumbers = ['G8GANEEDRWNUY'];

    var isWeekendItemNumber = function (itemNumber) {
        return (weekendItemNumbers.indexOf(itemNumber) >= 0);
    };

    var isShirtItemNumber = function (itemNumber) {
        return (shirtItemNumbers.indexOf(itemNumber) >= 0);
    };

    var isValidItemNumber = function (itemNumber) {
        return isWeekendItemNumber(itemNumber) || isShirtItemNumber(itemNumber);
    };

    var shouldProcessNotification = 
        paypal.payment_status === 'Completed' &&
        paypal.item_number &&
        paypal.option_selection1 &&
        isValidItemNumber(paypal.item_number);

    if (!shouldProcessNotification) {
        return res.status(200).send();
    }

    var email = paypal.option_selection1;
    var isShirtOrder = isShirtItemNumber(paypal.item_number);
    var isWeekendOrder = isWeekendItemNumber(paypal.item_number);

    var payment = {
        email: email,
        method: "paypal",
        isWeekendPass: isWeekendOrder,
        isShirt: isShirt,
        gross: paypal.payment_gross,
        fee: paypal.payment_fee
    };

    // TODO: Send POST back to Paypal
    // See: https://developer.paypal.com/webapps/developer/docs/classic/ipn/integration-guide/IPNIntro/
    db.add(payment, function (err) {
        if (err) {
            errors.log(err);
        }
        res.status(200).send();  
    });
});

module.exports = router;