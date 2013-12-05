// Declare app level module which depends on filters, and services
var createExamApp = angular.module('createExam', ['ngResource','commonService','ckEditorDirective','commonFilters']);

createExamApp.controller('createExamCtrl', ['$scope','$location','getAllCategoriesService','getSubCategoriesByCategoryCodeService', 'crudExamDetailsService','crudQuestionService','getSubCategoriesByExamCodeService',
                                          function($scope,$location,getAllCategoriesService,getSubCategoriesByCategoryCodeService,crudExamDetailsService,crudQuestionService,getSubCategoriesByExamCodeService) {
	$scope.host = $location.host();
	$scope.port = $location.port();
	$scope.categories = getAllCategoriesService.query({},function() {
		if($scope.categories && $scope.categories.length>0) {
			var examCode = getURLParameter('examCode'); 
			if(examCode && examCode.length >= 8) {
				$scope.subCategories  = getSubCategoriesByExamCodeService.query({examCode:examCode},function() {
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
		var isValid = true;
		if(!$("#examName").val() || $("#examName").val().length<1) {
			isValid = false;
			alert("Please enter valid Exam Name");
		} else if(!$("#examDescr").val() || $("#examDescr").val().length<2) {
			isValid = false;
			alert("Please enter valid Description");
		} else if(!$("#categoryCode").val() || $("#categoryCode").val().length<1) {
			isValid = false;
			alert("Please select valid Category");
		} else if(!$("#subCategoryCode").val() || $("#subCategoryCode").val().length<1) {
			isValid = false;
			alert("Please select valid Sub Category");
		}
		
		if(isValid) {
			$scope.examObj = crudExamDetailsService.crudExamDetails({examObj:$scope.examObj,action:action});
			if(action =='addQuestions') {
				$('#createExamTab a[href="#examQuestions"]').tab('show');
			}
		}
	};
	
	$scope.publishExam = function(action) {
		var isValid = true;
		if($scope.examObj && $scope.examObj.examCode.length>=8) {
			if(action!='delete') {
				if(isNaN($scope.examObj.examTime) || ($scope.examObj.examTime<5 && $scope.examObj.examTime>0)) {
					alert("Exam Time should be valid number greater then or equal to 5");
					isValid = false;
				}
			}
			
			if(action == 'deleteExam') {
				if(confirm("Exam and all questions related to this exam will be deactivated. This exam will never appear in your list or search results. Do you want to deactivate this exam?")) {
					$scope.examObj = crudExamDetailsService.crudExamDetails({examCode:$scope.examObj.examCode,action:action});
				}
			} else if(isValid) {
				$scope.examObj = crudExamDetailsService.crudExamDetails({examObj:$scope.examObj,action:action});
			}
		} else {
			alert('Please add exam details before saving this data');
			$('#createExamTab a[href="#examDetails"]').tab('show');
		}
	};
	
	$scope.addNewQuestion = function() {
		if($scope.examObj && $scope.examObj.examCode.length>=8) {
			$scope.isAddingNewQuestion =true;
			$scope.examObj.questionObj = new Object();
			$scope.examObj.questionObj.questionType = 'MCSA';
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
	
	$scope.addAdditionalOption = function() {
		 $scope.examObj.questionObj.questionOptions.push({optionDesc:"",isOptionRich:false});
	};
	  
	$scope.deleteAdditionalOption = function(index) {
		if(confirm("Do you want to remove this option? Data you have entered in this Option will be lost")) {
			$scope.examObj.questionObj.questionOptions.splice(index,1);
		}
	};
	
	$scope.setAnswerForOption = function(optList, opt) {
		 angular.forEach(optList, function (optObj) {
			 optObj.isAnswer = false;
	     });
	     opt.isAnswer = true;
	};
	
	$scope.saveQuestion = function(action) {
		var isValid = validateQuestionForm();
		
		if(isValid && $scope.examObj.questionObj.questionType == 'TORF') {
		  $scope.examObj.questionObj.questionOptions = new Array();
		  $scope.examObj.questionObj.questionOptions[0] = new Object();
		  $scope.examObj.questionObj.questionOptions[1] = new Object();
		  $scope.examObj.questionObj.questionOptions[0].optionDesc ="True";
		  $scope.examObj.questionObj.questionOptions[1].optionDesc ="False";
		  if(!$('[name=answer]:checked').val() ||  $('[name=answer]:checked').val().length<1) {
			  isValid = false;
			  alert("Please select valid answer");
		  } else {
			  if( $('[name=answer]:checked').val() == "option1") {
				  $scope.examObj.questionObj.questionOptions[0].isAnswer = true;
				  $scope.examObj.questionObj.questionOptions[1].isAnswer = false; 
			  } else {
				  $scope.examObj.questionObj.questionOptions[0].isAnswer = false;  
				  $scope.examObj.questionObj.questionOptions[1].isAnswer = true;
			  }
		  }
	   } else if($scope.examObj.questionObj.questionType == 'ET') {
			  $scope.examObj.questionObj.questionOptions = null;
			  $scope.examObj.questionObj.questionOptions = new Array();
			  $scope.examObj.questionObj.questionOptions[0] = new Object();
			  $scope.examObj.questionObj.questionOptions[0].optionDesc ="";
			  $scope.examObj.questionObj.questionOptions[0].isAnswer = false;  
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

function validateQuestionForm(questionObj) {
	var isValid = true;	
	  for(var instance in CKEDITOR.instances) { 
		  CKEDITOR.instances[instance].updateElement();
	  }
	  
	  if($('#question').val().trim().length<1) {
		  isValid = false;
		  alert("Please enter valid Question");
	  } else if($('#questionType').val() == 'MCSA' || $('#questionType').val() == 'MCMA') {
		  if($('#option1').val().trim().length<1) {
			  isValid = false;
			  alert("Please enter valid Option 1");
		  } else if($('#option2').val().trim().length<1) {
			  isValid = false;
			  alert("Please enter valid Option 2");
		  } else if(!$('[name=answer]:checked').val()) {
			  isValid = false;
			  alert("Please select valid Answer");
		  } else if ($('#questionType').val() == 'MCSA' && (!$('#'+$('[name=answer]:checked')[0].id.replace('Answer','')).val() || $('#'+$('[name=answer]:checked')[0].id.replace('Answer','')).val().length<1)) {
			  isValid = false;
			  alert("Answer you have selected doesn't have valid Option.");
		  } else if ($('#questionType').val() == 'MCMA') {
			  for(var i=0;i<$('[name=answer]:checked').length;i++) {
				  if($('#'+$('[name=answer]:checked')[i].id.replace('Answer','')).val().length<1) {
					  isValid = false;
				  }
			  }
			  if(!isValid) {
				  alert("Answer you have selected doesn't have valid Option."); 
			  }
		  }
	  } 
	return isValid;
}

$(document).ready(function() {
	$('#fileupload').fileupload({
        dataType: 'json',
        start: function (e, data) {
            $('#fileUploadMessage').html("<span style='color:green'>Uploading...Please Wait...</span>");
        },
        progress: function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#fileUploadMessage').html("<span style='color:green'>Uploading..."+progress+"%</span>");
        },
        done: function (e, data) {
        	if(data.result.success) {
        		$('#fileUploadMessage').html("<span style='color:green'>"+data.result.success+"</span>");
        		var scope = angular.element($("#examLogo")).scope();
        	    scope.$apply(function() {
        	        scope.examObj.examImg = data.result.examImg+"?"+Math.random();
        	    });
        	} else if(data.result.error) {
        		$('#fileUploadMessage').html("<span style='color:red'>"+data.result.error+"</span>");
        	}
        },
        fail: function (e, data) {
        	if(e) {
        		$('#fileUploadMessage').html("<span style='color:red'>Failed to upload image.Please try again</span>");
        	}
        }
    });
});






























