// trim()
// From: http://stackoverflow.com/questions/498970/how-do-i-trim-a-string-in-javascript
if (!String.prototype.trim) {
	String.prototype.trim=function(){return this.replace(/^\s\s*/, '').replace(/\s\s*$/, '');};
}

var main = function() {
	makePlaceholdersWorkInIE();

	setupValidation("#name");
	setupValidation("#email");
	setupValidation("#emailConfirm");
	setupMatchValidation("#emailConfirm", "#email");

	setupPopoverTips();
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

var setupMatchValidation = function(entrySelector, matchSelector) {

	var $entry = $(entrySelector);

	$entry.blur(function() {
		if ($(matchSelector).val() !== $entry.val()) {			
			$entry.addClass("sb-invalid");
		}
	});
};

var setupPopoverTips = function() {
	var popoverDelay = 250;

	// Maybe not ...
	// $("#name").popover({
	// 	placement : "bottom",
	// 	trigger : "focus",
	// 	title : "Welcome!",
	// 	content : "We hope you'll enjoy this form.",
	// 	delay : popoverDelay
	// });

	$("#email").popover({
		placement : "right",
		trigger : "focus",		
		title : "This is how we'll contact you.",
		content : "After the event is over, we'll forget about it.",
		delay : popoverDelay
	});

	$("#emailConfirm").popover({
		placement : "right",
		trigger : "focus",		
		title : "Please confirm your address.",
		content : "It's important, you know.",
		delay : popoverDelay
	});

	$(".next").popover({
		placement : "right",
		trigger : "manual",
		title : "",
		content : "Please make the frowns go away. <span class='label label-important'>:-(</span>",
		delay : popoverDelay
	});
};

var showInvalidFormTip = function() {
	$(".next").popover('show');
};

var hideInvalidFormTip = function() {
	$(".next").popover('hide');
};

var makePlaceholdersWorkInIE = function() {
	// Placeholder stuff for IE 9	
	// Requires jQuery and Modernizr
	// From http://kamikazemusic.com/quick-tips/jquery-html5-placeholder-fix/
	if(!Modernizr.input.placeholder){
	$("input").each(
		function(){
			if($(this).val()=="" && $(this).attr("placeholder")!=""){
				$(this).val($(this).attr("placeholder"));
				$(this).focus(function(){
				if($(this).val()==$(this).attr("placeholder")) $(this).val("");
			});
				$(this).blur(function(){
					if($(this).val()=="") $(this).val($(this).attr("placeholder"));
				});
			}
		});
	}
};