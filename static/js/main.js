$(document).ready(function() {

	$('.box-content').hide();

	$('.box h2').click(function() {
		$(this).parent().find('.box-content').slideToggle(500);
	})

	var formHandleFunction = function($form) {
		return function(result) {
			console.log(result);
			if (result.error) {
				$form.find('.formresult')
					.hide()
					.removeClass("success")
					.addClass("error")
					.html(result.error)
					.slideDown(250);
			} else {
				$form.find('.formresult')
					.hide()
					.removeClass("error")
					.addClass("success")
					.html("Hooray!")
					.slideDown(250);
			}
		}
	}

	$('#textalert-form').submit(function() {
		$.post("/signup", $(this).serialize(), formHandleFunction($(this)), 'json');
		return false;
	})

	$('#suggestion-form').submit(function() {
		$.post("/suggest", $(this).serialize(), formHandleFunction($(this)), 'json');
		return false;
	})

});