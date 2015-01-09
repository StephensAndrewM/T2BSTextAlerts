$(document).ready(function() {

	$('.box-content').hide();

	$('.box').click(function() {
		$(this).find('.box-content').slideToggle(2500);
	})

});