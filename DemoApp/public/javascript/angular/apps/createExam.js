// Declare app level module which depends on filters, and services
var createExamApp = angular.module('createExam', ['ngResource','commonService','ckEditorDirective','commonFilters']);

createExamApp.controller('createExamCtrl', ['$scope','getAllCategoriesService','getSubCategoriesByCategoryCodeService', 'crudExamDetailsService','crudQuestionService',
                                          function($scope,getAllCategoriesService,getSubCategoriesByCategoryCodeService,crudExamDetailsService,crudQuestionService) {
	
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
			$scope.examObj.questionObj = new Object();
			$scope.examObj.questionObj.questionType = 'MC';
			$scope.examObj.questionObj.questionOptions = [{optionDesc:"",isOptionRich:false},{optionDesc:"",isOptionRich:false}];
			$scope.examObj.questionObj.difficultyLevel = 0;
			if($scope.examObj.questionList) {
			  $scope.examObj.questionObj.questionNumber = $scope.examObj.questionList.length+1;
			} else {
			  $scope.examObj.questionObj.questionNumber = 1;
			}
		} else {
			alert('Please add exam details before adding questions');
			$('#createExamTab a[href="#examDetails"]').tab('show');
		}
	};
	
	$scope.saveQuestion = function(action) {
	  var isValid = true;	
	  for(var instance in CKEDITOR.instances) { 
		  CKEDITOR.instances[instance].updateElement();
	  }
	  
	  if($('#question').val().trim().length<2) {
		  isValid = false;
		  alert("Please enter valid question");
	  } else if($scope.examObj.questionObj.questionType == 'MC') {
		  if($('#option1').val().trim().length<2) {
			  isValid = false;
			  alert("Please enter valid option 1");
		  } else if($('#option2').val().trim().length<2) {
			  isValid = false;
			  alert("Please enter valid option 2");
		  } else if(!$('[name=answer]:checked').val()) {
			  isValid = false;
			  alert("Please select valid answer");
		  } else if(!$('[name=answer]:checked').val()) {
			  isValid = false;
			  alert("Please select valid answer.");
		  } else if($('[name=answer]:checked').val()) {
			  var checkedAnswers = $('[name=answer]:checked');
			  if(checkedAnswers) {
				  for(var j=0;j<checkedAnswers.length;j++) {
					  if($('#'+checkedAnswers[j].id.replace('_','')).val().trim().length<2) {
						  isValid = false;
						  alert("Please select valid answer. Answer you have selected doesn't have option value");
					  }
				  }
			  } else {
				  isValid = false;
				  alert("Please select valid answer."); 
			  }
		  }
	  }
	  
	  if(isValid) {
		  $scope.examObj.questionObj.success = null;
		  $scope.examObj.questionObj.error = null;
		  $scope.examObj = crudQuestionService.crudQuestionDetails({examCode:$scope.examObj.examCode,questionObj:$scope.examObj.questionObj,action:action});
	  }
	};
	
	$scope.editQuestion = function(questionNumber) {
		crudQuestionService.crudQuestionDetails({examCode:$scope.examObj.examCode,questionNumber:questionNumber,action:"getQuestionDetailsForEdit"},function(editQuestionObj) {
			$scope.examObj.questionObj = editQuestionObj;
			$scope.isAddingNewQuestion =true;
		});
	};
	
	$scope.deleteQuestion = function(questionNumber) {
		if(confirm("Do you want to delete this question permanently ?")) {
			crudQuestionService.crudQuestionDetails({examCode:$scope.examObj.examCode,questionNumber:questionNumber,action:"delete"},function(responseObj) {
				$scope.examObj = responseObj;
				$scope.addNewQuestion();
				alert('Question deleted successfully');
			});
		}
	};
	
	$scope.closeQuestionForm = function() {
		if(confirm("Are you sure you want to close this form? All data you haven't saved will be lost !")) {
			$scope.isAddingNewQuestion =false;  
			$scope.examObj.questionObj =null;
		}
	};
	  
	$scope.addAdditionalOption = function() {
		 $scope.examObj.questionObj.questionOptions.push({optionDesc:"",isOptionRich:false});
	};
	  
	$scope.deleteAdditionalOption = function(index) {
		if(confirm("Do you want to remove this option? Data you have entered in this Option will be lost")) {
			$scope.examObj.questionObj.questionOptions.splice(index,1);
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

createExamApp.factory('crudQuestionService',['$resource', function($resource) {
	return $resource('/user/crudQuestionDetails', {}, {
		crudQuestionDetails : {method : 'POST'}
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

function validateQuestionForm() {
	
}





























