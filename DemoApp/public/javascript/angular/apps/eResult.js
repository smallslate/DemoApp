var examResultApp = angular.module('examResultApp', ['ngResource','commonFilters']);

examResultApp.controller('examResultCtrl', ['$scope','examResultService',function($scope,examResultService) {
	var sessionCode = getURLParameter('sc');
	if(sessionCode && sessionCode.length>=8) {
		$scope.examObj = examResultService.query({action:'viewExamResult',sessionCode:sessionCode},function(data) {
			$scope.evalObj = new Object();
			$scope.evalObj.correct =0;
			$scope.evalObj.wrong =0;
			$scope.evalObj.notElav =0;
			$scope.evalObj.evalList = new Array();
			
			if($scope.examObj && $scope.examObj.examSession && $scope.examObj.examSession.evalAnswers && $scope.examObj.examSession.evalAnswers.answers) {
				$scope.examObj.examSession.updatedAt = moment($scope.examObj.examSession.updatedAt).format('lll');
				$scope.examObj.examSession.createdAt = moment($scope.examObj.examSession.createdAt).format('lll');
				
				for(var mcount in $scope.examObj.examSession.evalAnswers.answers) {
					var m = $scope.examObj.examSession.evalAnswers.answers[mcount];
					var ansObj = new Object();
					ansObj.isDeleted = true;
					ansObj.isAnswerCorrect ='NA';
					
					for(var qcount in $scope.examObj.questionList) {
						var q = $scope.examObj.questionList[qcount];
					    if(q.questionId == m.questionId) {
					    	ansObj.isDeleted = false;
					    	ansObj.question = q;
					    	ansObj.userAnswer = m.userAnswer;
					    	
					    	if(q.questionType == 'MCSA' || q.questionType == 'TORF') {
					    		for(opCount in q.questionOptions) {
					    			var op = q.questionOptions[opCount];
					    			if(op.isAnswer) {
					    				if(op.optionId == m.userAnswer) {
					    					ansObj.isAnswerCorrect =true;
					    					$scope.evalObj.correct+=1;
					    				} else {
					    					ansObj.isAnswerCorrect =false;
					    					$scope.evalObj.wrong+=1;
					    				}
					    			}	
					    		}
					    	} else if (q.questionType == 'MCMA') {
					    		var orgAns = new Array();
					    		for(opCount in q.questionOptions) {
					    			var op = q.questionOptions[opCount];
					    			if(op.isAnswer) {
					    				orgAns.push(op.optionId);
					    			}	
					    		}
					    		
					    		if(ansObj.userAnswer.sort().join(',') === orgAns.sort().join(',')) {
					    			ansObj.isAnswerCorrect =true;
			    					$scope.evalObj.correct+=1;
								} else {
									ansObj.isAnswerCorrect =false;
			    					$scope.evalObj.wrong+=1;
								}
					    	} else if (q.questionType == 'ET' && m.isAnswerCorrect == true) {
					    		ansObj.isAnswerCorrect = true;
					    		$scope.evalObj.correct+=1;
					    	} else if (q.questionType == 'ET' && m.isAnswerCorrect == false) {
					    		ansObj.isAnswerCorrect = false;
					    		$scope.evalObj.wrong+=1;
					    	} else if (q.questionType == 'ET' && m.isAnswerCorrect == 'NA') {
					    		ansObj.isAnswerCorrect = 'NA';
					    		$scope.evalObj.notElav+=1;
					    	} 
					    }
					 }
					 if(ansObj.isDeleted) {
						 ansObj.isAnswerCorrect = m.isAnswerCorrect;
						 if(m.isAnswerCorrect==true) {
							 $scope.evalObj.correct+=1;
						 } else if(m.isAnswerCorrect==false) {
							 $scope.evalObj.wrong+=1;
						 } else {
							 $scope.evalObj.notElav+=1; 
						 }
					 }
					$scope.evalObj.evalList.push(ansObj);
				}
			}
		});
	} else {
		alert('Your URL has been modified.You do not have access to view this page.');
	}	
}]);
		
examResultApp.factory('examResultService',['$resource', function($resource) {
	return $resource('/user/examResultService', {}, {
		query : {method : 'POST'}
	});
}]);