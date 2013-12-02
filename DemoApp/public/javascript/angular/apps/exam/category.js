// Declare app level module which depends on filters, and services
var categoryApp = angular.module('category', ['ngResource','commonService']);

categoryApp.controller('categoryCtrl', ['$scope','crudCategoryService','getCategoryByIdService', function($scope,crudCategoryService,getCategoryByIdService) {
	var urlCategoryId = getURLParameter('categoryId');
	if(urlCategoryId && urlCategoryId > 0) {
		$scope.categoryObj = getCategoryByIdService.query({categoryId:urlCategoryId});
	}

	$scope.crudCategory = function(action) {
		if($('#createCategory').valid()) {
			if(action =='delete') {
				if(confirm("Category will be deleted permanently !!!")) {
					$scope.categoryObj = crudCategoryService.crudCategory({categoryObj:$scope.categoryObj,action:action});
				}	
			} else {
				$scope.categoryObj = crudCategoryService.crudCategory({categoryObj:$scope.categoryObj,action:action});
			}
		}
	};

	$scope.$watch('categoryObj.categoryId', function() {
		if($scope.categoryObj && $scope.categoryObj.categoryId >0) {
			$scope.$evalAsync(function () {
				$('#createCategory').valid();
	        });
		}
	});
	
}]);

categoryApp.factory('crudCategoryService',['$resource', function($resource) {
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

