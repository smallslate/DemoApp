var createCardApp = angular.module('createCardApp', ['ngResource','commonService','ckEditorDirective','commonFilters']);

createCardApp.controller('createCardCtrl', ['$scope','getAllCategoriesService','getSubCategoriesByCategoryCodeService','getSubCategoriesByExamCodeService','crudFlashDeckDetailsService','crudFlashCardService',function($scope,getAllCategoriesService,getSubCategoriesByCategoryCodeService,getSubCategoriesByExamCodeService,crudFlashDeckDetailsService,crudFlashCardService) {
	
	$scope.categories = getAllCategoriesService.query(function() {
		if($scope.categories && $scope.categories.length>0) {
			var flashDeckCode = getURLParameter('fdc'); 
			if(flashDeckCode && flashDeckCode.length >= 8) {
				$scope.subCategories  = getSubCategoriesByExamCodeService.query({flashDeckCode:flashDeckCode},function() {
					if($scope.subCategories && $scope.subCategories.length>0) {
						$scope.flashDeckObj = crudFlashDeckDetailsService.crudFlashDeckDetails({flashDeckCode:flashDeckCode,action:'getFlashDeckDetails'});
					}
				});
			}
		}
	});
	
	$scope.onCategoryChange = function() {
		$scope.flashDeckObj.subCategoryCode ='';
		if($scope.flashDeckObj.categoryCode && $scope.flashDeckObj.categoryCode.length > 0) {
			$scope.subCategories  = getSubCategoriesByCategoryCodeService.query({categoryCode:$scope.flashDeckObj.categoryCode});  
		} else {
			$scope.subCategories = [];
		}
	};
	
	$scope.validateAddCards = function() {
		if(!($scope.flashDeckObj && $scope.flashDeckObj.flashDeckCode && $scope.flashDeckObj.flashDeckCode>=8)) {
			alert('Please save Flash Deck details before adding Flash Cards.');
			return false;
		}
	};
	
	$scope.validatePublishCards = function() {
		if(!($scope.flashDeckObj && $scope.flashDeckObj.flashDeckCode && $scope.flashDeckObj.flashDeckCode>=8)) {
			alert('Please save Flash Deck details before publishing.');
			return false;
		}
	};
	
	$scope.addNewCard = function() {
		if($scope.flashDeckObj && $scope.flashDeckObj.flashDeckCode.length>=8) {
			$scope.isAddingCard =true;
			$scope.flashDeckObj.newCard = new Object();
			if($scope.flashDeckObj.flashCards) {
			  $scope.flashDeckObj.newCard.flashCardNumber = $scope.flashDeckObj.flashCards.length+1;
			} else {
				$scope.flashDeckObj.newCard.flashCardNumber = 1;
			}
		} else {
			alert('Please save Flash Deck details before adding Flash Cards');
			$('#createCardsTab a[href="#cardDetails"]').tab('show');
		}
	};
	
	$scope.saveFlashCard = function(action) {
		var isValid = validateFlashCardForm();
		if(isValid) {
			$scope.flashDeckObj.newCard.success = null;
			$scope.flashDeckObj.newCard.error = null;
			$scope.flashDeckObj = crudFlashCardService.crudFlashCardDetails({flashDeckCode:$scope.flashDeckObj.flashDeckCode,newCardObj:$scope.flashDeckObj.newCard,action:action});
	   }
	};
	
	$scope.editFlashCard = function(flashCardNumber) {
		$scope.flashDeckObj.newCard = $scope.flashDeckObj.flashCards[flashCardNumber-1];
		$scope.isAddingCard =true;
	};
	
	$scope.deleteFlashCard = function(flashCardId) {
		if(confirm("Do you want to delete this Card permanently ?")) {
			$scope.flashDeckObj.newCard.success = null;
			$scope.flashDeckObj.newCard.error = null;
			$scope.flashDeckObj = crudFlashCardService.crudFlashCardDetails({flashCardId:flashCardId,flashDeckCode:$scope.flashDeckObj.flashDeckCode,action:'delete'});
		}
	};
	
	$scope.closeCardForm = function() {
		if(confirm("Are you sure you want to close this form? All data you haven't saved will be lost !")) {
			$scope.isAddingCard =false;  
			$scope.flashDeckObj.newCard =null;
		}
	};
	
	$scope.crudFlashDeckDetails = function(action) {
		var isValid = true;
		if(!$("#flashDeckName").val() || $("#flashDeckName").val().length<1) {
			isValid = false;
			alert("Please enter valid Flash Deck Name");
		} else if(!$("#flashDeckDescr").val() || $("#flashDeckDescr").val().length<2) {
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
			$scope.flashDeckObj = crudFlashDeckDetailsService.crudFlashDeckDetails({flashDeckObj:$scope.flashDeckObj,action:action});
			if(action =='addCards') {
				$('#createCardsTab a[href="#addCards"]').tab('show');
			}
		}
	};
	
}]);

createCardApp.factory('crudFlashDeckDetailsService',['$resource', function($resource) {
	return $resource('/user/crudFlashDeckDetails',{},{
		crudFlashDeckDetails : {method : 'POST'}
	});
}]);

createCardApp.factory('crudFlashCardService',['$resource', function($resource) {
	return $resource('/user/crudFlashCardDetails',{},{
		crudFlashCardDetails : {method : 'POST'}
	});
}]);

function validateFlashCardForm(flashCardObj) {
	var isValid = true;	
	  for(var instance in CKEDITOR.instances) { 
		  CKEDITOR.instances[instance].updateElement();
	  }
	  
	  if($('#cardFront').val().trim().length<1) {
		  isValid = false;
		  alert("Please enter valid Card Front Value");
	  } else if($('#cardBack').val().trim().length<1) {
		  isValid = false;
		  alert("Please enter valid Card Back Value");
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
        		var scope = angular.element($("#flashDeckLogo")).scope();
        	    scope.$apply(function() {
        	        scope.flashDeckObj.flashDeckImg = data.result.flashDeckImg+"?"+Math.random();
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


