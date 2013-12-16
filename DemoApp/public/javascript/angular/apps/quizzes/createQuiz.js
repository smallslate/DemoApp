// Declare app level module which depends on filters, and services
var createQuizApp = angular.module('createQuiz', ['ngResource','commonService','ckEditorDirective','commonFilters']);


createQuizApp.controller('createQuizCtrl', ['$scope','$location','getAllCategoriesService','getSubCategoriesByCategoryCodeService','crudQuizDetailsService','getSubCategoriesByExamCodeService','crudQuestionService',
                                            function($scope,$location,getAllCategoriesService,getSubCategoriesByCategoryCodeService,crudQuizDetailsService,getSubCategoriesByExamCodeService,crudQuestionService) {
	$scope.host = $location.host();
	$scope.port = $location.port();
	$scope.categories = getAllCategoriesService.query({},function() {
		if($scope.categories && $scope.categories.length>0) {
			var quizCode = getURLParameter('qc');
			if(quizCode && quizCode.length >= 8) {
				$scope.subCategories  = getSubCategoriesByExamCodeService.query({quizCode:quizCode},function() {
					if($scope.subCategories && $scope.subCategories.length>0) {
						$scope.quizObj = crudQuizDetailsService.crudQuizDetails({quizCode:quizCode,action:'getQuizAndQuestDetails'});						
					}
				});
			}
		}
	});
	
	$scope.onCategoryChange = function() {
		$scope.quizObj.subCategoryCode ='';
		if($scope.quizObj.categoryCode && $scope.quizObj.categoryCode.length > 0) {
			$scope.subCategories  = getSubCategoriesByCategoryCodeService.query({categoryCode:$scope.quizObj.categoryCode});  
		} else {
			$scope.subCategories = [];
		}
	};
	
	$scope.onAddQuestionsTabClick = function() {
		if(!$scope.quizObj || !$scope.quizObj.quizCode || !$scope.quizObj.quizCode.length>=8) {
			alert("Please save quiz details before adding questions");
			return false;
		}
	};
	
	$scope.onPublishQuizTabClick = function() {
		if(!$scope.quizObj || !$scope.quizObj.quizCode || !$scope.quizObj.quizCode.length>=8) {
			alert("Please save quiz details before publishing quiz");
		} else if(!$scope.quizObj.questionList || $scope.quizObj.questionList.length<=0) {
			alert("Please add questions to this quiz before publishing");
		}
	};
	
	$scope.crudQuizDetails = function(action) {
		var isValid = true;
		if(!$("#quizName").val() || $("#quizName").val().length<1) {
			isValid = false;
			alert("Please enter valid Quiz Name");
		} else if(!$("#quizDescr").val() || $("#quizDescr").val().length<2) {
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
			var tempQuizObj = new Object();
			tempQuizObj.quizName = $scope.quizObj.quizName;
			tempQuizObj.quizDescr = $scope.quizObj.quizDescr;
			tempQuizObj.categoryCode = $scope.quizObj.categoryCode;
			tempQuizObj.subCategoryCode = $scope.quizObj.subCategoryCode;
			tempQuizObj.quizCode = $scope.quizObj.quizCode;
			tempQuizObj.quizImg = $scope.quizObj.quizImg;
			tempQuizObj.isPublished = $scope.quizObj.isPublished;
			tempQuizObj.authorDetails = $scope.quizObj.authorDetails;
			tempQuizObj.references = $scope.quizObj.references;
			$scope.quizObj = crudQuizDetailsService.crudQuizDetails({quizObj:tempQuizObj,action:action});
			if(action =='addQuestions') {
				$('#createQuizTab a[href="#quizQuestions"]').tab('show');
			}
		}
	};
	
	$scope.addNewQuestion = function() {
		if($scope.quizObj && $scope.quizObj.quizCode.length>=8) {
			$scope.isAddingNewQuestion =true;
			$scope.quizObj.questionObj = new Object();
			$scope.quizObj.questionObj.questionType = 'MCSA';
			$scope.quizObj.questionObj.questionOptions = [{optionDesc:"",isOptionRich:false},{optionDesc:"",isOptionRich:false}];
			$scope.quizObj.questionObj.difficultyLevel = 0;
			if($scope.quizObj.questionList) {
			  $scope.quizObj.questionObj.questionNumber = $scope.quizObj.questionList.length+1;
			} else {
			  $scope.quizObj.questionObj.questionNumber = 1;
			}
		} else {
			alert('Please add Quiz details before adding questions');
			$('#createQuizTab a[href="#quizDetails"]').tab('show');
		}
	};
	
	$scope.setAnswerForOption = function(optList, opt) {
		 angular.forEach(optList, function (optObj) {
			 optObj.isAnswer = false;
	     });
	     opt.isAnswer = true;
	};
	
	$scope.deleteAdditionalOption = function(index) {
		if(confirm("Do you want to remove this option? Data you have entered in this Option will be lost")) {
			$scope.quizObj.questionObj.questionOptions.splice(index,1);
		}
	};
	
	$scope.addAdditionalOption = function() {
		 $scope.quizObj.questionObj.questionOptions.push({optionDesc:"",isOptionRich:false});
	};
	
	$scope.closeQuestionForm = function() {
		if(confirm("Are you sure you want to close this form? All data you haven't saved will be lost !")) {
			$scope.isAddingNewQuestion =false;  
			$scope.quizObj.questionObj =null;
		}
	};
	
	$scope.editQuestion = function(questionNumber) {
		$scope.quizObj.questionObj = new Object();
		$scope.quizObj.questionObj = $scope.quizObj.questionList[questionNumber-1];
		$scope.isAddingNewQuestion =true;
	};
	
	$scope.deleteQuestion = function(questionNumber) {
		if(confirm("Do you want to delete this question permanently ?")) {
			crudQuestionService.crudQuestionDetails({quizCode:$scope.quizObj.quizCode,questionNumber:questionNumber,action:"delete"},function(responseObj) {
				$scope.quizObj = responseObj;
				$scope.addNewQuestion();
				alert('Question deleted successfully');
			});
		}
	};
	
	$scope.saveQuestion = function(action) {
		var isValid = validateQuestionForm();
		if(isValid && $scope.quizObj.questionObj.questionType == 'TORF') {
		  $scope.quizObj.questionObj.questionOptions = new Array();
		  $scope.quizObj.questionObj.questionOptions[0] = new Object();
		  $scope.quizObj.questionObj.questionOptions[1] = new Object();
		  $scope.quizObj.questionObj.questionOptions[0].optionDesc ="True";
		  $scope.quizObj.questionObj.questionOptions[1].optionDesc ="False";
		  if(!$('[name=answer]:checked').val() ||  $('[name=answer]:checked').val().length<1) {
			  isValid = false;
			  alert("Please select valid answer");
		  } else {
			  if( $('[name=answer]:checked').val() == "option1") {
				  $scope.quizObj.questionObj.questionOptions[0].isAnswer = true;
				  $scope.quizObj.questionObj.questionOptions[1].isAnswer = false; 
			  } else {
				  $scope.quizObj.questionObj.questionOptions[0].isAnswer = false;  
				  $scope.quizObj.questionObj.questionOptions[1].isAnswer = true;
			  }
		  }
	   } 
	   if(isValid) {
	   		$scope.quizObj.questionObj.success = null;
	   		$scope.quizObj.questionObj.error = null;
	   		$scope.quizObj = crudQuestionService.crudQuestionDetails({quizCode:$scope.quizObj.quizCode,questionObj:$scope.quizObj.questionObj,action:action});
	   }
	};
	
	$scope.publishQuiz = function(action) {
		if(!$scope.quizObj || !$scope.quizObj.quizCode || !$scope.quizObj.quizCode.length>=8) {
			alert("Please save quiz details before publishing quiz");
			$('#createQuizTab a[href="#quizDetails"]').tab('show');
		} else if(!$scope.quizObj.questionList || $scope.quizObj.questionList.length<=0) {
			alert("Please add questions to this quiz before publishing");
			$('#createQuizTab a[href="#quizQuestions"]').tab('show');
		}
		
		if($scope.quizObj && $scope.quizObj.quizCode && $scope.quizObj.quizCode.length>=8) {
			if(action == 'deleteQuiz') {
				if(confirm("Quiz details and all questions related to this Quiz will be deactivated. This Quiz will never appear in your list or search results. Do you want to deactivate this Quiz?")) {
					$scope.quizObj = crudQuizDetailsService.crudQuizDetails({quizCode:$scope.quizObj.quizCode,action:action},function(responseObj) {
						alert('Quiz deleted successfully');
						$('#createQuizTab a[href="#quizDetails"]').tab('show');
					});
				}
			} else {
				var tempQuizObj = new Object();
				tempQuizObj.quizCode = $scope.quizObj.quizCode;
				tempQuizObj.references = $scope.quizObj.references;
				tempQuizObj.authorDetails = $scope.quizObj.authorDetails;
				$scope.quizObj = crudQuizDetailsService.crudQuizDetails({quizObj:tempQuizObj,action:action});
			}
		} 
	};
	
}]);

createQuizApp.factory('crudQuizDetailsService',['$resource', function($resource) {
	return $resource('/user/crudQuizDetails', {}, {
		crudQuizDetails : {method : 'POST'}
	});
}]);

createQuizApp.factory('crudQuestionService',['$resource', function($resource) {
	return $resource('/user/crudQuizQuestionDetails', {}, {
		crudQuestionDetails : {method : 'POST'}
	});
}]);

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
        		var scope = angular.element($("#quizLogo")).scope();
        	    scope.$apply(function() {
        	        scope.quizObj.quizImg = data.result.quizImg+"?"+Math.random();
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

function validateQuestionForm() {
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



















