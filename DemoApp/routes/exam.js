var db = require("../models/factory/Database"),
	aws = require("../models/factory/AWS"),
	Sequelize = require('sequelize'),
	fs = require('fs'),
	hashids = require("../models/factory/Hashids");

module.exports = Exam;

function Exam() {}
//---------------Category-------------------------------
Exam.category = function(req,res) {
	res.render('user/admin/category');	
};

Exam.crudCategory = function(req,res) {
	if(res.locals.isAdmin) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var categoryObj = requestObj.categoryObj;
			categoryObj.createdBy = categoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").create(categoryObj,[ 'categoryName','categoryDescr','categoryImg','createdBy','updatedBy']).success(function(newCategoryObj) {
				newCategoryObj.dataValues.success = "Category saved successfully";
				res.send(newCategoryObj.dataValues);
			}).error(function(err) {
				console.log('Exam.crudCategory action = create = '+err);
				categoryObj.error = "Cannot save category data.Please Try Again";
				res.send(categoryObj);
			});
		} else if(requestObj.action =='update') {
			var categoryObj = requestObj.categoryObj;
			categoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").update({categoryName:categoryObj.categoryName,categoryDescr:categoryObj.categoryDescr,categoryImg:categoryObj.categoryImg,updatedBy:categoryObj.updatedBy},{categoryId:categoryObj.categoryId})
			.success(function() {
				categoryObj.success = "Category updated successfully";
				res.send(categoryObj);
			}).error(function(err) {
				console.log('Exam.crudCategory action = update = '+err);
				categoryObj.error = "Cannot update category data.Please Try Again";
				res.send(categoryObj);
			});
		} else if(requestObj.action =='delete') {
			db.model("Category").find({where:{categoryId:requestObj.categoryObj.categoryId}}).success(function(categoryObj) {
				categoryObj.setSubCategories([]);
				categoryObj.destroy()
				.success(function() {
					categoryObj = new Object();
					categoryObj.success = "Category deleted successfully";
					res.send(categoryObj);
				}).error(function(err) {
					console.log('Exam.crudCategory action = update = '+err);
					categoryObj.error = "Cannot delete category.Please Try Again";
					res.send(categoryObj);
				});
			});
		} 
	}
};

Exam.getAllCategories = function(req,res) {
	db.model("Category").findAll({where:{isActive: true}}).success(function(categoryList) {
		res.send(categoryList);
	}).error(function(err) {
		res.send(null);
	});
};

Exam.getCategoryById = function(req,res) {
	db.model("Category").find({where:{categoryId:req.query.categoryId,isActive: true}}).success(function(categoryObj) {
		res.send(categoryObj);
	}).error(function(err) {
		res.send(null);
	});
};

//---------------Sub Categories-------------------------------

Exam.subCategory = function(req,res) {
	res.render('user/admin/subCategory');	
};

Exam.editCatSubCat = function(req,res) {
	res.render('user/admin/editCatSubCat');	
};

Exam.getSubCategoryById = function(req,res) {
	db.model("SubCategory").find({where:{subCategoryId:req.query.subCategoryId,isActive: true}}).success(function(subCategoryObj) {
		res.send(subCategoryObj);
	}).error(function(err) {
		res.send(null);
	});
};

Exam.getSubCategoriesByCategoryCode = function(req,res) {
	db.model("Category").find({where:{categoryCode:req.query.categoryCode,isActive: true}}).success(function(categoryObj) {
		if(categoryObj) {
			categoryObj.getSubCategories().success(function(subCategoryList) {
				res.send(subCategoryList);
			});
		} else {
			res.send(null);
		}
	}).error(function(err) {
		res.send(null);
	});
};

Exam.getSubCategoriesByExamCode = function(req,res) {
	var examCode = req.query.examCode;
	if(examCode && examCode.length>=8) {
		db.model("Exam").find({ where: {examCode: examCode,isActive:true} }).success(function(dbExamObj) {
			db.model("Category").find({where:{categoryCode:dbExamObj.categoryCode,isActive: true}}).success(function(categoryObj) {
				if(categoryObj) {
					categoryObj.getSubCategories().success(function(subCategoryList) {
						res.send(subCategoryList);
					});
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		}).error(function(err) {
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Exam.getAllCatAndSubCat = function(req,res) {
	db.model("Category").findAll({where:{isActive: true}}).success(function(categoryList) {
		var chainer = new Sequelize.Utils.QueryChainer;
		categoryList.forEach(function(categoryObj) {
			chainer.add(categoryObj.getSubCategories());
	    });
		chainer.runSerially().success(function(results) {
			var categoryListWithSubCat = [];
			for(var i=0;i<categoryList.length;i++) {
				categoryList[i].dataValues.subCategoryList = results[i];
				categoryListWithSubCat[i] = categoryList[i].dataValues;
			}
			res.send(categoryListWithSubCat);
		}).error(function(errors) {
			res.send(null);
		});
		
	}).error(function(err) {
		res.send(null);
	});
};

Exam.crudSubCategory = function(req,res) {
	if(res.locals.isAdmin) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var subCategoryObj = requestObj.subCategoryObj;
			subCategoryObj.createdBy = subCategoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").find({where:{categoryId:subCategoryObj.categoryId,isActive: true}}).success(function(categoryObj) {
				db.model("SubCategory").create(subCategoryObj,[ 'subCategoryName','subCategoryDescr','subCategoryImg','createdBy','updatedBy']).success(function(newSubCategoryObj) {
					categoryObj.addSubCategory(newSubCategoryObj).success(function() {
						db.model("SubCategory").find({where:{subCategoryId:newSubCategoryObj.subCategoryId}}).success(function(insertedSubCategoryObj) {
							insertedSubCategoryObj.dataValues.success ="Sub category saved successfully";
							res.send(insertedSubCategoryObj.dataValues);
						});
					}).error(function(err) {
						console.log('Exam.crudSubCategory action = create = '+err);
						newSubCategoryObj.error ="Cannot save sub category. Please try again";
						res.send(newSubCategoryObj);
					});
				}).error(function(err) {
					console.log('Exam.crudSubCategory action = create = '+err);
					subCategoryObj.error = "Cannot save sub category data.Please Try Again";
					res.send(subCategoryObj);
				});
			}).error(function(err) {
				console.log('Exam.crudSubCategory Category you have selected cannot be found/disabled action = create = '+err);
				subCategoryObj.error ="Category you have selected cannot be found/disabled. Please select different category";
				res.send(null);
			});
		} else if(requestObj.action =='update') {
			var subCategoryObj = requestObj.subCategoryObj;
			subCategoryObj.updatedBy = req.user.loggedInUserId;
			db.model("SubCategory").update({subCategoryName:subCategoryObj.subCategoryName,subCategoryDescr:subCategoryObj.subCategoryDescr,categoryId:subCategoryObj.categoryId,subCategoryImg:subCategoryObj.subCategoryImg,updatedBy:subCategoryObj.updatedBy},{subCategoryId:subCategoryObj.subCategoryId})
			.success(function() {
				subCategoryObj.success = "Sub Category updated successfully";
				res.send(subCategoryObj);
			}).error(function(err) {
				console.log('Exam.crudCategory action = update = '+err);
				subCategoryObj.error = "Cannot update sub category data.Please Try Again";
				res.send(subCategoryObj);
			});
		}  else if(requestObj.action =='delete') {
			var subCategoryObj = requestObj.subCategoryObj;
			db.model("SubCategory").destroy({subCategoryId:subCategoryObj.subCategoryId})
			.success(function() {
				subCategoryObj = new Object();
				subCategoryObj.success = "Category deleted successfully";
				res.send(subCategoryObj);
			}).error(function(err) {
				console.log('Exam.crudCategory action = update = '+err);
				subCategoryObj.error = "Cannot delete category.Please Try Again";
				res.send(subCategoryObj);
			});
		}
	}
};

//---------------Exams-------------------------------
Exam.createExam = function(req,res) {
	res.render('user/exam/createExam');	
};

Exam.viewExams = function(req,res) {
	res.render('user/profile/viewExams');	
};

Exam.exam = function(req,res) {
	res.render('exam/exam');	
};

Exam.epreview = function(req,res) {
	res.render('exam/epreview');	
};

Exam.eresult = function(req,res) {
	res.render('user/profile/eresult');	
};

Exam.allMyExamResults = function(req,res) {
	res.render('user/profile/allMyExamResults');	
};

Exam.getMyExams = function(req,res) {
	if(req.isAuthenticated()) {
		db.model("Exam").findAll({ where: {createdBy:req.user.loggedInUserId,isActive:true} }).success(function(examList) {
			res.send(examList);
		}).error(function(err) {
			console.log('Exam.getMyExams '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Exam.crudExamDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var examObj = requestObj.examObj;
			examObj.createdBy = examObj.updatedBy = req.user.loggedInUserId;
			db.model("Exam").create(examObj,[ 'examName','examCode','examDescr','examImg','categoryCode','subCategoryCode','createdBy','updatedBy']).success(function(newExamObj) {
				newExamObj.dataValues.examCode = newExamObj.examCode = hashids.encrypt(newExamObj.examId);
				newExamObj.save(['examCode']);
				newExamObj.dataValues.success ='Exam details saved successfully';
				res.send(newExamObj.dataValues);
			}).error(function(err) {
				console.log('Exam.crudExam action = create = '+err);
				newExamObj.error = "Cannot save Exam details.Please try again";
				res.send(newExamObj);
			});
		} else if(requestObj.action =='update' || requestObj.action =='addQuestions') {
			var examObj = requestObj.examObj;
			db.model("Exam").find({ where: {examCode: examObj.examCode,isActive:true} }).success(function(dbExamObj) {
				if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
					dbExamObj.examName = examObj.examName;
					dbExamObj.examDescr = examObj.examDescr;
					dbExamObj.examImg = examObj.examImg;
					dbExamObj.categoryCode = examObj.categoryCode;
					dbExamObj.subCategoryCode = examObj.subCategoryCode;
					dbExamObj.updatedBy = examObj.updatedBy = req.user.loggedInUserId;
					dbExamObj.save(['examName','examDescr','examImg','categoryCode','subCategoryCode','updatedBy']);
					examObj.success ='Exam details updated successfully';
					res.send(examObj);
				} else {
					examObj.error = "You do not have access to update this exam.";
					res.send(examObj);
				}
			}).error(function(err) {
				console.log('Exam.crudExam action = update = '+err);
				examObj.error = "Cannot update Exam details.Please try again";
				res.send(examObj);
			});
		} else if(requestObj.action =='getExamAndQueDetails') {
			db.model("Exam").find({ where: {examCode: req.body.examCode,isActive:true} }).success(function(dbExamObj) {
				if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
					dbExamObj.getQuestions({include:[{model: db.model("QuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
						dbExamObj.dataValues.questionList =questionList;
						res.send(dbExamObj.dataValues);
					});
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		} else if(requestObj.action =='updatePublishData' || requestObj.action =='publishExam' || requestObj.action =='unpublishExam') {
			var examObj = requestObj.examObj;
			db.model("Exam").find({ where: {examCode: examObj.examCode,isActive:true} }).success(function(dbExamObj) {
				if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
					dbExamObj.examTime = examObj.examTime;
					dbExamObj.examReferences = examObj.examReferences;
					dbExamObj.authorDetails = examObj.authorDetails;
					dbExamObj.showResultsAfterExam = examObj.showResultsAfterExam;
					dbExamObj.updatedBy = examObj.updatedBy = req.user.loggedInUserId;

					if(requestObj.action =='publishExam') {
						dbExamObj.isPublished = true;
						examObj.isPublished = true;
						dbExamObj.save(['examTime','examReferences','authorDetails','updatedBy','isPublished','showResultsAfterExam']);
						examObj.publishSuccessMessage ='Exam is published successfully. All users will be able to access this exam. This exam will now appear in search results';
					} else if(requestObj.action =='unpublishExam') {
						dbExamObj.isPublished = false;
						examObj.isPublished = false;
						dbExamObj.save(['examTime','examReferences','authorDetails','updatedBy','isPublished','showResultsAfterExam']);
						examObj.publishSuccessMessage ='Exam is now un published. Users will not be able to access this exam. This exam will not appear in search results';
					} else {
						dbExamObj.save(['examTime','examReferences','authorDetails','updatedBy','showResultsAfterExam']);
						examObj.publishSuccessMessage ='Exam details updated successfully';
					}
					res.send(examObj);
				} else {
					examObj.publishErrorMessage = "You do not have access to update this exam.";
					res.send(examObj);
				}
			}).error(function(err) {
				console.log('Exam.crudExam action = updatePublishData = '+err);
				examObj.publishErrorMessage = "Cannot update Exam details.Please try again";
				res.send(examObj);
			});
		} else if(requestObj.action == 'deleteExam') {
			db.model("Exam").find({ where: {examCode: requestObj.examCode,isActive:true} }).success(function(dbExamObj) {
				if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
					dbExamObj.isActive =false;
					dbExamObj.isPublished =false;
					dbExamObj.updatedBy = req.user.loggedInUserId;
					dbExamObj.save(['isActive','updatedBy','isPublished']);
					examObj =  new Object();
					examObj.publishSuccessMessage = "Exam has been deleted successfully. If you want to revert back your deletion, please send email to support@smallslate.com";
					res.send(examObj);
				} else {
					examObj.publishErrorMessage = "You do not have access to Delete this exam.";
					res.send(examObj);
				}
			}).error(function(err) {
				console.log('Exam.crudExam action = deleteExam = '+err);
				examObj.publishErrorMessage = "Unable to Delete Exam.Please try again";
				res.send(examObj);
			});
		}
	} else {
		res.send(null);
	}
};

Exam.uploadExamLogo = function(req,res) {
	var mimeType = req.files.image.type;
	var size = req.files.image.size;
	var path = req.files.image.path;
	
	if(!req.isAuthenticated()) {
		fs.unlink(path);
		res.send({error:"You do not have access to upload image"});
	} else if(size>500200) {
		fs.unlink(path);
		res.send({error:"File size should be less then 500KB"});
	} else if(mimeType!="image/jpeg" && mimeType!="image/png" && mimeType!="image/gif"){
		fs.unlink(path);
		res.send({error:"Invalid file format. You can upload only gif , jpeg and png file formats"});
	} else {
		db.model("Exam").find({ where: {examCode: req.body.examCode,isActive:true} }).success(function(dbExamObj) {
			if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
				if(dbExamObj.examImg !="logo.png") {
					console.log(dbExamObj.examImg);
					aws.getAWSExamBucket().deleteObject({Key:dbExamObj.examImg}, function(err, data) {
					      if (err && err.code!="MissingRequiredParameter") {
					    	  console.log(err);
					    	  fs.unlink(path);
					    	  res.send(null);
					      } else {
					    	  insertExamLogo(req,res,dbExamObj);
					      }
					});
				} else {
					insertExamLogo(req,res,dbExamObj);
				}
			} else {
				fs.unlink(path);
				res.send({error:"You do not have access to upload image for this Exam"});
			}
		}).error(function(err) {
			fs.unlink(path);
			res.send({error:"Exam data cannot be found.Please update exam details and then upload image"});
		});
	}
};

Exam.getExamPreview = function(req,res) { 
	var examCode = req.body.examCode;
	if(examCode && examCode.length>=8) {
		db.model("Exam").find({ where: {examCode:examCode,isActive:true,isPublished:true} }).success(function(dbExamObj) {
			res.send(dbExamObj);
		}).error(function(err) {
			console.log('Exam.crudExam getExamPreview = getExamPreview = '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Exam.examService = function(req,res) { 
	var action = req.body.action;
	var examCode = req.body.examCode;

	if(action && action == 'startExam' && examCode && examCode.length>=8 && req.isAuthenticated()) {
		db.model("Exam").find({ where: {examCode:examCode,isActive:true,isPublished:true} }).success(function(dbExamObj) {
			dbExamObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuestionOption"),as:'questionOptions',attributes: ['optionId', 'optionDesc','isOptionRich']}]}).success(function(questionList) {
				dbExamObj.dataValues.questionList =questionList;
				db.model("ExamSession").create({userId:req.user.loggedInUserId,examStatus:'START',isResultPublished:dbExamObj.showResultsAfterExam}).success(function(newExamSessionObj) {
					newExamSessionObj.sessionCode = hashids.encrypt(newExamSessionObj.examSessionId);
					newExamSessionObj.save(['sessionCode']);
					dbExamObj.addExamSession(newExamSessionObj).success(function() {
						dbExamObj.dataValues.examSession =newExamSessionObj;
						res.send(dbExamObj.dataValues);
					});
				}).error(function(err) {
					console.log('Exam.crudCategory ExamSession = ExamSession = '+err);
					res.send(null);
				});
			}).error(function(err) {
				console.log('Exam.examService examService = examService get questions = '+err);
				res.send(null);
			});
		}).error(function(err) {
			console.log('Exam.examService examService = examService = '+err);
			res.send(null);
		});
	} else if(action == 'submitExam') {
		var examSession = req.body.examSession;
		db.model("ExamSession").find({ where: {sessionCode:examSession.sessionCode,userId:req.user.loggedInUserId,examStatus:'START',examId:examSession.examId}}).success(function(dbExamSession) {
			if(dbExamSession && dbExamSession.examSessionId>0) {
				db.model("Question").findAll({where:{examId:examSession.examId},include:[{model: db.model("QuestionOption"),as:'questionOptions'}]}).success(function(questionsList) {
					if(questionsList && questionsList.length>0) {
						dbExamSession.answers = JSON.stringify(examSession.answers);
						dbExamSession.evalAnswers = JSON.stringify(evalAnswers(examSession,questionsList));
						dbExamSession.examStatus = 'SUBMIT';
						dbExamSession.save(['answers','evalAnswers','examStatus']).success(function(dbExamSession) {
							res.send({success:'success'});
						}).error(function(err) {
							console.log('Exam.examService ExamSession = ExamSession = '+err);
							res.send({error:'Failed to save your data.Cannot find you session.'});
						});
					}
				});
			} else {
				res.send({error:'Failed to save your data.Cannot find you session.'});
			}
		}).error(function(err) {
			console.log('Exam.examService ExamSession = ExamSession = '+err);
			res.send({error:'Failed to save your data.Please try again.'});
		});
	} else {
		res.send(null);
	}
};

function evalAnswers(examSession,questionsList) {
	var answerList = new Object();
	answerList.answers = {};
	answerList.correct =0;
	answerList.wrong =0;
	answerList.notEval =0;
	for(var i = 0;i<questionsList.length;i++) {
		var answerDescObj = new Object();
		answerDescObj.questionId = questionsList[i].questionId;
		if(questionsList[i].questionType =='MCSA' || questionsList[i].questionType =='TORF') {
			for(var j = 0;j<questionsList[i].questionOptions.length;j++) {
				if(questionsList[i].questionOptions[j].isAnswer) {
					if(questionsList[i].questionOptions[j].optionId == examSession.answers[questionsList[i].questionId].answer) {
						answerDescObj.isAnswerCorrect =true;
						answerList.correct+=1;
					} else {
						answerDescObj.isAnswerCorrect =false;
						answerList.wrong+=1;
					}
					answerDescObj.userAnswer = examSession.answers[questionsList[i].questionId].answer;
					answerDescObj.orginalAnswer = questionsList[i].questionOptions[j].optionId;
					break;
				}
			}
		} else if(questionsList[i].questionType =='MCMA') {
			var userMCMAanswers = new Array();
			var MCMAanswers = new Array();
			
			for(var j=0;j<examSession.answers[questionsList[i].questionId].answer.length;j++) {
				if(examSession.answers[questionsList[i].questionId].answer[j]!=null) {
					userMCMAanswers.push(examSession.answers[questionsList[i].questionId].answer[j]);
				}
			}
			for(var j = 0;j<questionsList[i].questionOptions.length;j++) {
				if(questionsList[i].questionOptions[j].isAnswer) {
					MCMAanswers.push(questionsList[i].questionOptions[j].optionId);
				}
			}
			answerDescObj.userAnswer = userMCMAanswers;
			answerDescObj.orginalAnswer =MCMAanswers;
			if(userMCMAanswers.sort().join(',') === MCMAanswers.sort().join(',')){
				answerDescObj.isAnswerCorrect =true;
				answerList.correct+=1;
			} else {
				answerDescObj.isAnswerCorrect =false;
				answerList.wrong+=1;
			}
		} else {
			answerDescObj.isAnswerCorrect ='NA';
			answerList.notEval+=1;
			answerDescObj.userAnswer = examSession.answers[questionsList[i].questionId].answer;
		}
		answerList.answers[questionsList[i].questionId] = answerDescObj;
    }
	return answerList;
}

Exam.examResultService = function(req,res) { 
	var action = req.body.action;
	var sessionCode = req.body.sessionCode;
	if(action == 'viewExamResult') {
		db.model("ExamSession").find({where:{sessionCode:sessionCode,examStatus:'SUBMIT'}}).success(function(dbExamSessionObj) {
			db.model("Exam").find({where:{examId:dbExamSessionObj.examId}}).success(function(dbExamObj) {
				if(dbExamSessionObj.userId == req.user.loggedInUserId || dbExamObj.createdBy == req.user.loggedInUserId || res.locals.isAdmin) {
					dbExamObj.getQuestions({include:[{model: db.model("QuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
						dbExamObj.dataValues.questionList = questionList;
						if(dbExamSessionObj.isResultPublished == true) {
							dbExamSessionObj.answers = eval("("+dbExamSessionObj.answers+ ")");
							dbExamSessionObj.evalAnswers = eval("("+dbExamSessionObj.evalAnswers+")"); 
							dbExamObj.dataValues.examSession = dbExamSessionObj;
						}
						db.model("User").find({ where:{userId:dbExamSessionObj.userId},attributes: ['userDisplayName']}).success(function(userObj) {
							dbExamObj.dataValues.userObj = userObj;
							res.send(dbExamObj.dataValues);
						});
					});
				}
			}).error(function(err) {
				res.send(null);
			});
		}).error(function(err) {
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

function insertExamLogo(req,res,dbExamObj) {
	var path = req.files.image.path;
	var mimeType = req.files.image.type;
	var fileName = "exam"+dbExamObj.examCode+".png";
	if(mimeType =="image/jpeg") {
		fileName = "exam"+dbExamObj.examCode+".jpeg";
	} else if(mimeType=="image/gif") {
		fileName = "exam"+dbExamObj.examCode+".gif";
	}
	
	fs.readFile(path, function(err, file_buffer) {
		if(err) {
			res.send({error:"Cannot upload image. Please try again."});
		} else {
			var params = {
		      Key: fileName,
		      Body: file_buffer,
		      ACL: 'public-read',
		      ContentType: mimeType
		    };
			
			aws.getAWSExamBucket().putObject(params, function(err, data) {
				fs.unlink(path);
			      if (err) {
			    	  res.send({error:"Cannot upload image. Please try again."});
			      } else {
			    	  dbExamObj.examImg = fileName; 
			    	  dbExamObj.save(['examImg']);
			    	  res.send({success:"Image uploaded successfully.",examImg:fileName});
			      }
			});
		}
	});
}

Exam.allMyExamResultsService = function(req,res) { 
	var action = req.body.action;
	if(action == 'getAllMyExamResults') {
		getAllMyExamResults(req,res);
	} else if(action == 'deleteMyResult') {
		console.log(req.body.sessionCode);
		db.model("ExamSession").find({where:{userId:req.user.loggedInUserId,sessionCode:req.body.sessionCode}}).success(function(examSessionObj) {
			if(examSessionObj.hasAuthorDeleted == true) {
				examSessionObj.destroy().success(function() {
					getAllMyExamResults(req,res);
				});
			} else {
				examSessionObj.hasUserDeleted = true;
				examSessionObj.save(['hasUserDeleted']).success(function() {
					getAllMyExamResults(req,res);
				}).error(function(err) {
					res.send(null);
				});
			}
		});
	} else {
		res.send(null);
	}
};

function getAllMyExamResults(req,res) {
	db.model("ExamSession").findAll({where:{userId:req.user.loggedInUserId,hasUserDeleted:false},order: 'createdAt DESC'}).success(function(examSessionList) {
		var examIds = new Array();
		for(var i=0;i<examSessionList.length;i++) {
			if(examIds.indexOf(examSessionList[i].examId)==-1) {
				examIds.push(examSessionList[i].examId);
			}
		}
		db.model("Exam").findAll({where:{examId:examIds}}).success(function(dbExamList) {
			var myResults =new Array();
			for(var i=0;i<dbExamList.length;i++) {
				var resultExamObj = new Object();
				resultExamObj.sessionList = new Array();
				resultExamObj.examObj = dbExamList[i];
				for(var j=0;j<examSessionList.length;j++) {
					if(examSessionList[j].examId == dbExamList[i].examId) {
						resultExamObj.sessionList.push(examSessionList[j]);
					}
				}
				myResults.push(resultExamObj);
			}
			res.send(myResults);
		});
	}).error(function(err) {
		res.send(null);
	});
}

//---------------Question-------------------------------
Exam.crudQuestionDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var reqExamCode =  req.body.examCode;
		var reqQuestionObj = req.body.questionObj;
		
		db.model("Exam").find({ where: {examCode: reqExamCode,isActive:true} }).success(function(dbExamObj) {
			if(res.locals.isAdmin || dbExamObj.createdBy == req.user.loggedInUserId) {
				if(req.body.action=='create') {
					reqQuestionObj.createdBy = reqQuestionObj.updatedBy = req.user.loggedInUserId;
					db.model("Question").create(reqQuestionObj,[ 'questionNumber','questionType','question','questionIsRich','answer','answerDescr','answerDescrIsRich','createdBy','updatedBy','difficultyLevel']).success(function(insertedQuestionObj) {
							dbExamObj.addQuestion(insertedQuestionObj).success(function() {
								for(var k=0;k<reqQuestionObj.questionOptions.length;k++) {
									reqQuestionObj.questionOptions[k].questionId = insertedQuestionObj.questionId;
								}
								db.model("QuestionOption").bulkCreate(reqQuestionObj.questionOptions, ['optionDesc','isOptionRich','questionId','isAnswer']).success(function() {
									dbExamObj.getQuestions({include:[{model: db.model("QuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
										insertedQuestionObj.getQuestionOptions().success(function(opts) {
											dbExamObj.dataValues.questionList =questionList;
											dbExamObj.dataValues.questionObj = insertedQuestionObj.dataValues;
											dbExamObj.dataValues.questionObj.questionOptions = opts;
											dbExamObj.dataValues.questionObj.success ='Question details saved successfully';
											dbExamObj.numberOfQuestions = dbExamObj.numberOfQuestions+1;
											dbExamObj.save(['numberOfQuestions']);
											res.send(dbExamObj.dataValues);
										});
									});
                                  });
							}).error(function(err) {
								console.log('Exam.crudExam cannot add question to exam = '+err);
								reqQuestionObj.error = "Cannot save question details.Please try again";
								dbExamObj.questionObj = reqQuestionObj;
								res.send(dbExamObj);
							});
						}).error(function(err) {
							console.log('Exam.crudExam action = create = '+err);
							newExamObj.error = "Cannot save Exam details.Please try again";
							res.send(newExamObj);
						});
				} else if(req.body.action=='update') {
					db.model("Question").find({where:{questionId:reqQuestionObj.questionId}}).success(function(dbQuestionObj) {
						dbQuestionObj.questionType = reqQuestionObj.questionType;
						dbQuestionObj.question = reqQuestionObj.question;
						dbQuestionObj.questionIsRich = reqQuestionObj.questionIsRich;
						dbQuestionObj.answer = reqQuestionObj.answer;
						dbQuestionObj.answerDescr = reqQuestionObj.answerDescr;
						dbQuestionObj.answerDescrIsRich = reqQuestionObj.answerDescrIsRich;
						dbQuestionObj.updatedBy = req.user.loggedInUserId;
						dbQuestionObj.difficultyLevel = reqQuestionObj.difficultyLevel;
						dbQuestionObj.save().success(function() {
						db.model("QuestionOption").destroy({questionId:dbQuestionObj.questionId}).success(function() {
							for(var k=0;k<reqQuestionObj.questionOptions.length;k++) {
								reqQuestionObj.questionOptions[k].questionId = dbQuestionObj.questionId;
							}
							db.model("QuestionOption").bulkCreate(reqQuestionObj.questionOptions, ['optionDesc','isOptionRich','questionId','isAnswer']).success(function() {
									dbExamObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuestionOption"),as:'questionOptions'}]}).success(function(questionList) {
										dbQuestionObj.getQuestionOptions().success(function(opts) {
											dbExamObj.dataValues.questionList =questionList;
											dbExamObj.dataValues.questionObj = dbQuestionObj.dataValues;
											dbExamObj.dataValues.questionObj.questionOptions = opts;
											dbExamObj.dataValues.questionObj.success ='Question details updated successfully';
											res.send(dbExamObj.dataValues);
										});
									});
	                            });
							});
						});
					});
				} else if(req.body.action=='getQuestionDetailsForEdit') {
					dbExamObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuestionOption"),as:'questionOptions'}],where:{questionNumber:req.body.questionNumber}}).success(function(questionList) {
						if(questionList.length>0) {
							res.send(questionList[0]);
						} else {
							res.send(null);
						}
					});
				} else if(req.body.action=='delete') {
					dbExamObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuestionOption"),as:'questionOptions'}],where:{questionNumber:req.body.questionNumber}}).success(function(questionList) {
						if(questionList.length>0) {
							var toDeleteObj = questionList[0];
							for(var k=0;k<toDeleteObj.questionOptions.length;k++) {
								toDeleteObj.questionOptions[k].destroy();
							}
							
							toDeleteObj.destroy().success(function() {
								dbExamObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuestionOption"),as:'questionOptions'}]}).success(function(questionList) {
									var chainer = new Sequelize.Utils.QueryChainer;
									for(var kk=0;kk<questionList.length;kk++) {
										questionList[kk].questionNumber = kk+1;
										chainer.add(questionList[kk].save());
									}
									chainer.runSerially().success(function(results) {
										dbExamObj.dataValues.questionList = questionList;
										dbExamObj.dataValues.questionObj =null;
										dbExamObj.numberOfQuestions = dbExamObj.numberOfQuestions-1;
										if(dbExamObj.numberOfQuestions < 0) {
											dbExamObj.numberOfQuestions =0;
										}
										dbExamObj.save(['numberOfQuestions']);
										res.send(dbExamObj.dataValues);
									}).error(function(errors) {
										res.send(null);
									});
								}); 
							});
						} else {
							res.send(null);
						}
					});
				}
			} else {
				examObj.questionObj.error = "You do not have access to add/edit questions for this exam.";
				res.send(null);
			}
		}).error(function(err) {
			console.log('Exam.crudQuestionDetails = '+err);
			examObj.questionObj.error = "Cannot update question details.Exam you have selected is invalid.Please try again";
			res.send(null);
		});
	} else {
		res.send(null);
	}
};