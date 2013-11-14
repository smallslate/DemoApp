angular.module('commonFilters', ['ngSanitize'])
.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };
}).filter('reverse', function() {
    return function(items) {
    	if(items && items.length>0) {
    		return items.slice().reverse();
    	}
    };
});