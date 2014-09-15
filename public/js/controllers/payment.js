'use strict';

function PaymentCtrl(session, $scope, $http, rsvpFlow, isSecure) {
    rsvpFlow.setScreen(rsvpFlow.screens.payment);

    var jQuery;
    $scope.frowns = {};
    initFrown('payment');

    $scope.stripe = {};
    $scope.payment = session.payment;
    $scope.shirt = session.shirt;
    $scope.isSubmitting = false;

    var paypalCodes = {
        weekend: "AQUACQJZJ5CDQ",
        weekendAndShirt: "G8GANEEDRWNUY"
    };

    var stripeHandler = undefined;


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

    if (isSecure) {
        var stripeHandler = StripeCheckout.configure({
            key: 'pk_test_e4Cs1MEaICcgILXVjTWGmIBg',
            image: '/img/rsvp/logo-black.png',
            name: "Swing & Blues Weekend",

            email: session.person.email,
            allowRememberMe: false,

            token: function (token) {
                $scope.isSubmitting = true;
                updateSessionFromScope();
                
                var data = {
                    token: token,
                    rsvp: session
                };
                
                // Use the token to create the charge on the server side.
                $http.post('/payments/stripe', data)
                .success(function (data, status) {
                    submitRsvp();
                })
                .error(function (data, status) {
                    console.log("ERROR");
                    console.log(data);
                });                
            }
        });
    }

    var openStripeCheckout = function () {
        if (!stripeHandler) {
            return;
        }

        var amount = 5000;
        var description = "Weekend pass ($50.00)";

        if ($scope.shirt.isBuying) {
            amount = 6500;
            description = "Weekend pass + shirt ($65.00)";    
        }

        stripeHandler.open({
            description: description,
            amount: amount
        });
    };    
    $scope.openStripeCheckout = openStripeCheckout;


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
        updateSessionFromScope();

        // Go to Paypal if that is the payment method.
        if ($scope.payment.method === 'paypal') {
            submitPaypal();
            return;
        }

        // Open Stripe if we're using cards.
        if ($scope.payment.method === 'card') {
            openStripeCheckout();
            $scope.isSubmitting = false;
            return;
        }

        // Otherwise submit to our server
        submitRsvp();
    };

    function submitRsvp() {
        rsvpFlow.submit(session, function () {
            $scope.isSubmitting = false;

            session.meta.submitted = true;
            session.save();
            
            rsvpFlow.next(session);
        });
    }



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

    $scope.$watch('shirt.isBuying', function () {
        if ($scope.shirt.isBuying) {
            $scope.paypalCode = paypalCodes.weekendAndShirt;
        }
        else {
            $scope.paypalCode = paypalCodes.weekend;
        }

        // use jQuery, because updating values directly
        // in Angular doesn't exactly work.
        $('#paypal-code').val($scope.paypalCode);
    });

    function updateSessionFromScope() {
        session.payment = $scope.payment;
        session.shirt = $scope.shirt;
        session.save();
    }
}
PaymentCtrl.$inject = ['session','$scope', '$http', 'rsvpFlow', 'isSecure'];