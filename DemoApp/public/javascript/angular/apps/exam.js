var examApp = angular.module('exam', ['ngResource','commonFilters']);

examApp.controller('examCtrl', ['$scope','examService', function($scope,examService) {
	var examCode = getURLParameter('ec'); 
	if(examCode && examCode.length>=8) {
		$scope.examObj = examService.query({action:'startExam',examCode:examCode},function() {
			$scope.answerList = {};
			for(var i=0;i<$scope.examObj.questionList.length;i++) {
				$scope.answerList[$scope.examObj.questionList[i].questionId] ={questionId:$scope.examObj.questionList[i].questionId,answer:new Array()};
			}
			$scope.selectedQuestion = $scope.examObj.questionList[0];
		});
	} else {
		alert('Your URL has been modified.You cannot take this exam for security reasons.Please close this window and select valid exam.');
	}
	
	$scope.selectQuestion = function(index) {
		$scope.selectedQuestion = $scope.examObj.questionList[index];
	};
	
	$scope.submitExam = function() {
		if(confirm("Are exam will be submitted for evaluation?")) {
			var examSession = new Object();
			examSession = $scope.examObj.examSession;
			examSession.examId = $scope.examObj.examId;
			examSession.answers = $scope.answerList;
			examService.query({action:'submitExam',examSession:examSession},function(data) {
				if(data.success && data.success =='success') {
					window.open("/user/eresult?sc="+$scope.examObj.examSession.sessionCode,'_self');
				} else if(data.error) {
					alert(data.error);
				}
			});
		}
	};
	
	$scope.hasAnswered = function(index) {
		var localQuestionObj = $scope.examObj.questionList[index];
		var localAnswer = $scope.answerList[$scope.examObj.questionList[index].questionId].answer;
		if((localQuestionObj.questionType =='MCSA' || localQuestionObj.questionType =='TORF') && localAnswer && localAnswer>0) {
			return true;
		} else if(localQuestionObj.questionType =='ET' && localAnswer && localAnswer.length>0) {
			return true;
		} else if(localQuestionObj.questionType =='MCMA' && localAnswer && localAnswer.length>0) {
			for(var i=0;i<localAnswer.length;i++) {
				if(localAnswer[i] && localAnswer[i]!=false) {
					return true;	
				}
			}
		}
		return false;
	};
}]);

examApp.factory('examService',['$resource', function($resource) {
	return $resource('/user/examService', {}, {
		query : {method : 'POST'}
	});
}]);
