function onValidationHighlight(element) {
	$(element).closest('.form-group').removeClass('success').addClass('error');
}

function onValidationSuccess(element) {
	$(element).remove();
}
