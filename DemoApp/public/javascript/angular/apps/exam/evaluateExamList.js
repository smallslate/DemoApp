var evaluateExamListApp = angular.module('evaluateExamListApp', ['ngResource']);
evaluateExamListApp.controller('evaluateExamListCtrl', ['$scope','getMyExamsService','evaluateExamList','deleteResultFromAuthorList',function($scope,getMyExamsService,evaluateExamList,deleteResultFromAuthorList) {
	$scope.myExamsList = getMyExamsService.query(function(data) {
		var examCode = getURLParameter('ec');
		if(examCode && examCode.length>=8) {
			for(var k=0;k<$scope.myExamsList.length;k++) {
				if($scope.myExamsList[k].examCode == examCode) {
					$scope.selectedExam = $scope.myExamsList[k];
					$scope.evaluateExamList = evaluateExamList.query({examCode:examCode});	
				}
			}
		}
	});	
	
	$scope.onExamChange = function() {
		if($scope.selectedExam && $scope.selectedExam.examId>0) {
			$scope.evaluateExamList = evaluateExamList.query({examCode:$scope.selectedExam.examCode});	
		}
	};
	
	$scope.deleteFromMyList = function(examSessionId) {
		if(examSessionId && examSessionId.length>0) {
			if(confirm("After deletion, this result will never appear in your list. Do you want to delete this result ?")) {
				$scope.evaluateExamList = deleteResultFromAuthorList.query({examSessionId:examSessionId,examCode:$scope.selectedExam.examCode});	
			}
		} else {
			alert('Please select valid result to delete');
		}
	};
}]);

evaluateExamListApp.factory('getMyExamsService',['$resource', function($resource) {
	return $resource('/user/getMyExams', {}, {
		query : {method : 'POST',isArray : true}
	});
}]);

evaluateExamListApp.factory('evaluateExamList',['$resource', function($resource) {
	return $resource('/user/getEvaluateExamList', {}, {
		query : {method : 'POST',isArray : true}
	});
}]);

evaluateExamListApp.factory('deleteResultFromAuthorList',['$resource', function($resource) {
	return $resource('/user/deleteResultFromAuthorList', {}, {
		query : {method : 'POST',isArray : true}
	});
}]);

evaluateExamListApp.filter('timeFormat', function() {
	return function(val) {
		return moment(val).format('lll');
	};
});