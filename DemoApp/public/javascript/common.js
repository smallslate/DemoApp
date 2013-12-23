function onValidationHighlight(element) {
	$(element).closest('.form-group').removeClass('success').addClass('error');
}

function onValidationSuccess(element) {
	$(element).remove();
}

function getURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}

//$( document ).ready(function() {
//	if($('#searchQuery').val()!=undefined) {
//		$('#searchQuery').typeahead({                                
//			name: 'sq',                                                          
//			remote: {
//		        url: '/searchSuggestions',
//		        filter: function (parsedResponse) {
//		            return parsedResponse;
//		        }
//		    }    
//		});
//	}	
//});