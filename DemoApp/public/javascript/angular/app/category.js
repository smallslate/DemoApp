// Declare app level module which depends on filters, and services
var categoryApp = angular.module('category', ['ngResource']);

categoryApp.controller('categoryCtrl', ['$scope','categoryService', function($scope,categoryService) {
	$scope.crudCategory = function(action) {
		if($('#createCategory').valid()) {
			$scope.categoryObj = categoryService.crudCategory({categoryObj:$scope.categoryObj,action:action});
		}
	};
}]);

categoryApp.factory('categoryService',['$resource', function($resource) {
	return $resource('/user/admin/crudCategory', {}, {
		crudCategory : {method : 'POST'}
	});
}]);

$(document).ready(function() {
	$('#createCategory').validate({
		ignore: 'input:hidden:not(input:hidden.required)',
		rules : {
			categoryName : {
				required : true,
				minlength : 2
			},
			categoryDescr : {
				required : true,
				minlength : 2
			}
		},
		highlight : function(element) {
			onValidationHighlight(element);
		},
		success : function(element) {
			onValidationSuccess(element);
		}
	});
});

