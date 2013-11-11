// Declare app level module which depends on filters, and services
var subCategoryApp = angular.module('subCategory', ['ngResource','commonService']);

subCategoryApp.controller('subCategoryCtrl', ['$scope','crudSubCategoryService','getAllCategoriesService','getSubCategoryByIdService', 
                                              function($scope,crudSubCategoryService,getAllCategoriesService,getSubCategoryByIdService) {
	$scope.categories = getAllCategoriesService.query({},function() {
		var urlSubCategoryId = getURLParameter('subCategoryId');
		if(urlSubCategoryId && urlSubCategoryId > 0) {
			$scope.subCategoryObj = getSubCategoryByIdService.query({subCategoryId:urlSubCategoryId});
		}
	});
	
	$scope.crudSubCategory = function(action) {
		if($('#createSubCategory').valid()) {
			if(action =='delete') {
				if(confirm("Sub category will be deleted permanently !!!")) {
					$scope.subCategoryObj = crudSubCategoryService.crudSubCategory({subCategoryObj:$scope.subCategoryObj,action:action});
				}	
			} else {
				$scope.subCategoryObj = crudSubCategoryService.crudSubCategory({subCategoryObj:$scope.subCategoryObj,action:action});
			}
		}
	};
    
	$scope.$watch('subCategoryObj.subCategoryId', function() {
		if($scope.subCategoryObj && $scope.subCategoryObj.subCategoryId > 0) {
			$scope.$evalAsync(function () {
				$('#createSubCategory').valid();
	        });
		}
	});
	
}]);

subCategoryApp.factory('crudSubCategoryService',['$resource', function($resource) {
	return $resource('/user/admin/crudSubCategory', {}, {
		crudSubCategory : {method : 'POST'}
	});
}]);

$(document).ready(function() {
	$('#createSubCategory').validate({
		ignore: 'input:hidden:not(input:hidden.required)',
		rules : {
			subCategoryName : {
				required : true,
				minlength : 2
			},
			categoryId : {
				required : true,
			},
			subCategoryDescr : {
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

