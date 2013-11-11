// Declare app level module which depends on filters, and services
var createExamApp = angular.module('createExam', ['ngResource','commonService']);

createExamApp.controller('createExamCtrl', ['$scope','getAllCategoriesService','getSubCategoriesByCategoryCodeService', 'crudExamDetailsService',
                                          function($scope,getAllCategoriesService,getSubCategoriesByCategoryCodeService,crudExamDetailsService) {
	
	$scope.categories = getAllCategoriesService.query({},function() {
		if($scope.categories && $scope.categories.length>0) {
			var examCode = getURLParameter('examCode'); 
			var catCode = getURLParameter('catCode'); 
			if(examCode && catCode && examCode.length >= 8) {
				$scope.subCategories  = getSubCategoriesByCategoryCodeService.query({categoryCode:catCode},function() {
					if($scope.subCategories && $scope.subCategories.length>0) {
						$scope.examObj = crudExamDetailsService.crudExamDetails({examCode:examCode,action:'getExamAndQueDetails'});						
					}
				});
			}
		}
	});
	
	$scope.onCategoryChange = function() {
		$scope.examObj.subCategoryCode ='';
		if($scope.examObj.categoryCode && $scope.examObj.categoryCode.length > 0) {
			$scope.subCategories  = getSubCategoriesByCategoryCodeService.query({categoryCode:$scope.examObj.categoryCode});  
		} else {
			$scope.subCategories = [];
		}
	};
	
	$scope.crudExamDetails = function(action) {
		if($('#examDetailsForm').valid()) {
			$scope.examObj = crudExamDetailsService.crudExamDetails({examObj:$scope.examObj,action:action});
			if(action =='addQuestions') {
				$('#createExamTab a[href="#examQuestions"]').tab('show');
			}
		}
	};
	
	$scope.addNewQuestion = function() {
		if($scope.examObj && $scope.examObj.examCode.length>0) {
			$scope.isAddingNewQuestion =true;
		} else {
			alert('Please add exam details before adding questions');
			$('#createExamTab a[href="#examDetails"]').tab('show');
		}
	};
	
	$scope.$watch('$scope.examObj.examCode', function() {
		if($scope.examObj && $scope.examObj.examCode && $scope.examObj.examCode.length > 0) {
			$scope.$evalAsync(function () {
				$('#examDetailsForm').valid();
	        });
		}
	});
}]);

createExamApp.factory('crudExamDetailsService',['$resource', function($resource) {
	return $resource('/user/crudExamDetails', {}, {
		crudExamDetails : {method : 'POST'}
	});
}]);

$(document).ready(function() {
	$('#examDetailsForm').validate({
		rules : {
			examName : {
				required : true,
				minlength : 2
			},
			examDescr : {
				required : true,
				minlength : 2
			},
			categoryCode : {
				required : true,
				minlength : 1
			},
			subCategoryCode : {
				required : true,
				minlength : 1
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