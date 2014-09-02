// trim()
// From: http://stackoverflow.com/questions/498970/how-do-i-trim-a-string-in-javascript
if (!String.prototype.trim) {
    String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
}

var jQueryThings = function() {
    makePlaceholdersWorkInIE();

    setupValidation("#name");
    setupValidation("#email");

    setupPopoverTips();

    return {
        showInvalidFormTip: function() {
            $(".next").popover('show');
        },
        hideInvalidFormTip: function() {
            $(".next").popover('hide');
        }
    };
};

// Make a custom "sb-invalid" class that goes away
// when an element is focused.
var setupValidation = function(selector) {
    $(selector).blur(function() {
        var elm = $(this);
        if (isInvalid(elm)) {
            elm.addClass("sb-invalid");
        }
    });

    $(selector).focus(function() {
        $(this).removeClass("sb-invalid");
    });
};

var isInvalid = function(elm) {
    return (elm.hasClass("ng-invalid") && !elm.hasClass("ng-pristine"));
};

var setupPopoverTips = function() {
    var popoverDelay = 250;

    $("#email").popover({
        container: "body",
        placement : "bottom",
        trigger : "focus",      
        title : "This is how we'll contact you.",
        content : "After the event is over, we'll forget about it.",
        delay : popoverDelay
    });

    $(".next").popover({
        placement : "top",
        trigger : "manual",
        title : "",
        html: true,
        content : "Please make the frowns go away. <span class='label label-danger'>:-(</span>",
        delay : popoverDelay
    });
};

var makePlaceholdersWorkInIE = function() {
    // TODO: Requires another lib
    // $('input').placeholder();
};