'use strict';

function PaymentCtrl(session, $scope, $http, rsvpFlow) {
    rsvpFlow.setScreen(rsvpFlow.screens.payment);

    var jQuery;
    $scope.frowns = {};
    initFrown('payment');

    $scope.payment = session.payment;
    $scope.shirt = session.shirt;
    $scope.isSubmitting = false;

    // TODO: Make a frown service
    var maybeShowFrowns = function () {
        var frowns = $scope.frowns;
        var payment = $scope.payment;

        // Frown if payment is empty.
        frowns.payment = !payment.method ? true : "";

        // If we have a frown, don't navigate.
        for (var frown in frowns) {
            if (frowns[frown]) {                
                jQuery.showInvalidFormTip();
                return false;
            }
        }

        return true;
    };

    // TODO: Make a frown service
    function initFrown (name) {
        if ($scope.frowns[name]) {
            $scope.frowns[name] = "";  
        }
    };

    // TODO: Make a frown service
    $scope.isFrowny = function (name) {
        return $scope.frowns[name];
    };

    // TODO: Frown service, or put it in RsvpCtrl
    $scope.removeFrown = function (name) {
        if ($scope.frowns[name]) {
            $scope.frowns[name] = "";  
        }

        jQuery.hideInvalidFormTip();
    };

    // TODO: Frown service, or put it in RsvpCtrl
    $scope.$watch('$viewContentLoaded', function() {   
        jQuery = jQueryThings(); // Defined in jQueryThings.js
    });

    var submitPaypal = function () {
        $('#paypal-form').submit();
    };


    $scope.finish = function () {
        var isFormValid = maybeShowFrowns();
        if (!isFormValid) {
            // :-(
            return;
        }

        if ($scope.isSubmitting) {
            // do nothing
            return;
        }

        $scope.isSubmitting = true;

        session.payment = $scope.payment;
        session.shirt = $scope.shirt;
        session.save();

        // Go to Paypal if that is the payment method.
        if ($scope.payment.method === 'paypal') {
            submitPaypal();
            return;
        }

        // Otherwise submit to our server
        rsvpFlow.submit(session, function () {
            $scope.isSubmitting = false;

            session.meta.submitted = true;
            session.save();
            
            rsvpFlow.next(session);
        });
    };

    $scope.setPayment = function (method) {
        $scope.payment.method = method;
        $scope.removeFrown('payment');
    };

    $scope.isPayment = function (method) {
        return ($scope.payment.method === method);
    };

    $scope.setBuyingShirt = function (val) {
        if (val) {
            $scope.shirt.isBuying = true;
        }
        else {
            $scope.shirt.isBuying = false;
        }
    };

    $scope.isBuyingShirt = function (val) {
        return val === $scope.shirt.isBuying;
    };
}
PaymentCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow'];