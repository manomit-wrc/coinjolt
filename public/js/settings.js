$(document).ready(function () {
	$('#myonoffswitch').on('change', function () {
		var value = $(this).val();
		alert (value);
	});
});