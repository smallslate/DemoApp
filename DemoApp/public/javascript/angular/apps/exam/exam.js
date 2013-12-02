var examApp = angular.module('exam', ['ngResource','commonFilters']);

examApp.controller('examCtrl', ['$scope','examService','$timeout', function($scope,examService,$timeout) {
	var examCode = getURLParameter('ec'); 
	if(examCode && examCode.length>=8) {
		$scope.examObj = examService.query({action:'startExam',examCode:examCode},function() {
			$scope.answerList = {};
			for(var i=0;i<$scope.examObj.questionList.length;i++) {
				$scope.answerList[$scope.examObj.questionList[i].questionId] ={questionId:$scope.examObj.questionList[i].questionId,answer:new Array()};
			}
			$scope.selectedQuestion = $scope.examObj.questionList[0];
			if($scope.examObj.examTime && $scope.examObj.examTime>=5) {
				$scope.examTimeMin = $scope.examObj.examTime;
				$scope.examTimeSec = 0;
				$timeout($scope.onTimeout,1000);
			}
		});
	} else {
		alert('Your URL has been modified.You cannot take this exam for security reasons.Please close this window and select valid exam.');
	}
	
	$scope.onTimeout = function(){
        $scope.examTimeSec--;
        if($scope.examTimeSec<0) {
        	$scope.examTimeMin--;
        	$scope.examTimeSec = 59;
        }
        if($scope.examTimeMin == 0 && $scope.examTimeSec == 0) {
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
			alert('Exam has ended.Please click OK to submit exam');
        } else {
        	mytimeout = $timeout($scope.onTimeout,1000);
        }
    };
 
    
	$scope.selectQuestion = function(index) {
		$scope.selectedQuestion = $scope.examObj.questionList[index];
	};
	
	$scope.selectNext = function(type) {
		console.log(type);
		if(type=='Previous') {
			console.log($scope.selectedQuestion.questionNumber);
			$scope.selectedQuestion = $scope.examObj.questionList[$scope.selectedQuestion.questionNumber-2];
		} else if(type=='Next') {
			console.log($scope.selectedQuestion.questionNumber);
			$scope.selectedQuestion = $scope.examObj.questionList[$scope.selectedQuestion.questionNumber];
		}
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
