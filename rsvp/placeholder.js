// From http://kamikazemusic.com/quick-tips/jquery-html5-placeholder-fix/

$(document).ready(function() {
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
});