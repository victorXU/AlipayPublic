$('#myTab a').click(function() {
	$(this).tab('show');
});

$('#reservation').daterangepicker();

//--Jquery Select2--
$("#e1").select2({
	placeholder: "Select a State"
});

$('#registrationForm').bootstrapValidator();

$('input.btn_submit').click(function() {
	if ($('#registrationForm').data('bootstrapValidator').validate().isValid()) {
		// alert(1);
	} else {
		// alert(2);
	}
});