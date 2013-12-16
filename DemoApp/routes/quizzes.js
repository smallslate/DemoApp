var db = require("../models/factory/Database"),
	aws = require("../models/factory/AWS"),
	Sequelize = require('sequelize'),
	fs = require('fs'),
	hashids = require("../models/factory/Hashids");
module.exports = Quizzes;

function Quizzes() {}

Quizzes.quizHome = function(req,res) {
	res.render('quizzes/quizHome');	
};

Quizzes.createQuiz = function(req,res) {
	res.render('user/quizzes/create/createQuiz');	
};

Quizzes.myQuizzes = function(req,res) {
	res.render('user/quizzes/myQuizzes');	
};

Quizzes.quizPreview = function(req,res) {
	res.render('quizzes/qpreview');	
};

Quizzes.exploreQuizzes = function(req,res) {
	res.render('quizzes/exploreQuizzes');	
};

Quizzes.searchQuiz = function(req,res) {
	res.render('quizzes/searchQuiz');	
};

Quizzes.quiz = function(req,res) {
	if(req.query.qn=='finish') {
		
		
		
		res.render('quizzes/exploreQuizzes');
	}
	db.model("Quiz").find({ where: {quizCode: req.query.qc,isActive:true} }).success(function(dbQuizObj) {
		if(dbQuizObj && dbQuizObj.quizId>0) {
			if(req.query.qn=='finish') {
				dbQuizObj.noOfViews+=1;
				dbQuizObj.save(['noOfViews']);
				res.render('quizzes/exploreQuizzes');
			} else {
				db.model("QuizQuestion").find({where:{quizId:dbQuizObj.quizId,questionNumber:req.query.qn},include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}]}).success(function(dbQuestionObj) {
					if(dbQuestionObj && dbQuestionObj.questionId && dbQuestionObj.questionId>0) {
						res.render('quizzes/quiz',{quizObj:dbQuizObj,questionObj:dbQuestionObj});
					} else {
						res.render('quizzes/exploreQuizzes');
					}
				});
			}
		} else {
			res.render('quizzes/exploreQuizzes');
		}
	}).error(function(err) {
		res.render('quizzes/exploreQuizzes');
	});
};

Quizzes.crudQuizDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var requestObj = req.body;
		var quizObj = requestObj.quizObj;
		if(requestObj.action =='create') {
			quizObj.createdBy = quizObj.updatedBy = req.user.loggedInUserId;
			db.model("Quiz").create(quizObj,[ 'quizName','quizDescr','categoryCode','subCategoryCode','createdBy','updatedBy']).success(function(newQuizObj) {
				newQuizObj.dataValues.quizCode = newQuizObj.quizCode = hashids.encrypt(newQuizObj.quizId);
				newQuizObj.save(['quizCode']);
				newQuizObj.dataValues.success ='Quiz details saved successfully';
				res.send(newQuizObj.dataValues);
			}).error(function(err) {
				console.log('Quizzes.crudQuizDetails action = create = '+err);
				quizObj.error = "Cannot save Quiz details.Please try again";
				res.send(quizObj);
			});
		} else if(requestObj.action =='update' || requestObj.action =='addQuestions') {
			db.model("Quiz").find({ where: {quizCode: quizObj.quizCode,isActive:true}}).success(function(dbQuizObj) {
				if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
					dbQuizObj.quizName = quizObj.quizName;
					dbQuizObj.quizDescr = quizObj.quizDescr;
					dbQuizObj.categoryCode = quizObj.categoryCode;
					dbQuizObj.subCategoryCode = quizObj.subCategoryCode;
					dbQuizObj.updatedBy = quizObj.updatedBy = req.user.loggedInUserId;
					dbQuizObj.save(['quizName','quizDescr','categoryCode','subCategoryCode','updatedBy']);
					quizObj.success ='Quiz details updated successfully';
					dbQuizObj.getQuestions({include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
						quizObj.questionList =questionList;
						res.send(quizObj);
					});
				} else {
					quizObj.error = "You do not have access to update this Quiz.";
					res.send(quizObj);
				}
			}).error(function(err) {
				console.log('Quizzes.crudQuizDetails action = update = '+err);
				quizObj.error = "Cannot update Quiz details.Please try again";
				res.send(quizObj);
			});
		} else if(requestObj.action =='getQuizAndQuestDetails') {
			db.model("Quiz").find({ where: {quizCode: req.body.quizCode,isActive:true} }).success(function(dbQuizObj) {
				if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
					dbQuizObj.getQuestions({include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
						dbQuizObj.dataValues.questionList =questionList;
						res.send(dbQuizObj.dataValues);
					});
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		} else if(requestObj.action =='updatePublishData' || requestObj.action =='publishQuiz' || requestObj.action =='unpublishQuiz') {
			db.model("Quiz").find({ where: {quizCode: quizObj.quizCode,isActive:true} }).success(function(dbQuizObj) {
				if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
					dbQuizObj.references = quizObj.references;
					dbQuizObj.authorDetails = quizObj.authorDetails;
					dbQuizObj.updatedBy = req.user.loggedInUserId;
					if(requestObj.action =='publishQuiz' || requestObj.action =='unpublishQuiz') {
						db.model("SubCategory").find({where:{subCategoryCode:dbQuizObj.subCategoryCode,isActive: true}}).success(function(dbSubCategory) {
							if(requestObj.action =='publishQuiz') {
								dbQuizObj.isPublished = true;
								dbQuizObj.save(['references','authorDetails','updatedBy','isPublished']);
								dbQuizObj.dataValues.publishSuccessMessage ='Quiz is published successfully. All users will be able to access this Quiz. This Quiz will now appear in search results';
								dbSubCategory.numberOfQuizzes+=1;
							} else if(requestObj.action =='unpublishQuiz') {
								dbQuizObj.isPublished = false;
								dbQuizObj.save(['references','authorDetails','updatedBy','isPublished']);
								dbQuizObj.dataValues.publishSuccessMessage ='Quiz is now un published. Users will not be able to access this Quiz. This Quiz will not appear in search results';
								dbSubCategory.numberOfQuizzes-=1;
							}
							dbSubCategory.save();
							dbQuizObj.getQuestions({include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
								dbQuizObj.dataValues.questionList =questionList;
								if(requestObj.action =='publishQuiz') {
									dbQuizObj.dataValues.publishSuccessMessage ='Quiz is published successfully. All users will be able to access this Quiz. This Quiz will now appear in search results';
								} else if(requestObj.action =='unpublishQuiz') {
									dbQuizObj.dataValues.publishSuccessMessage ='Quiz is now un published. Users will not be able to access this Quiz. This Quiz will not appear in search results';
								}
								res.send(dbQuizObj.dataValues);
							});
						});
					} else {
						dbQuizObj.save(['references','authorDetails','updatedBy']);
						dbQuizObj.getQuestions({include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
							dbQuizObj.dataValues.questionList =questionList;
							dbQuizObj.dataValues.publishSuccessMessage ='Quiz details updated successfully';
							res.send(dbQuizObj.dataValues);
						});
					}
				} else {
					quizObj.publishErrorMessage = "You do not have access to update this Quiz.";
					res.send(quizObj);
				}
			}).error(function(err) {
				console.log('quizObj.crudQuiz action = updatePublishData = '+err);
				quizObj.publishErrorMessage = "Cannot update Quiz details.Please try again";
				res.send(quizObj);
			});
		} else if(requestObj.action == 'deleteQuiz') {
			quizObj = new Object();
			db.model("Quiz").find({ where: {quizCode: requestObj.quizCode,isActive:true} }).success(function(dbQuizObj) {
				if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
					dbQuizObj.isActive =false;
					dbQuizObj.isPublished =false;
					dbQuizObj.updatedBy = req.user.loggedInUserId;
					dbQuizObj.save(['isActive','updatedBy','isPublished']);
					quizObj.success = "Quiz has been deleted successfully. If you want to revert back your deletion, please send email to support@smallslate.com";
					db.model("SubCategory").find({where:{subCategoryCode:dbQuizObj.subCategoryCode,isActive: true}}).success(function(dbSubCategory) {
						dbSubCategory.numberOfQuizzes-=1;
						dbSubCategory.save();
						res.send(quizObj);
					});
				} else {
					quizObj.publishErrorMessage = "You do not have access to Delete this Quiz.";
					res.send(quizObj);
				}
			}).error(function(err) {
				console.log('Quiz.crudQuiz action = deleteQuiz = '+err);
				quizObj.publishErrorMessage = "Unable to Delete Quiz.Please try again";
				res.send(quizObj);
			});
		}
	} else {
		res.send(null);
	}
};

Quizzes.uploadQuizLogo = function(req,res) {
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
		db.model("Quiz").find({ where: {quizCode: req.body.quizCode,isActive:true} }).success(function(dbQuizObj) {
			if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
				if(dbQuizObj.quizImg !="logo.png") {
					aws.getAWSBucket().deleteObject({Key:dbQuizObj.quizImg}, function(err, data) {
					      if (err && err.code!="MissingRequiredParameter") {
					    	  console.log(err);
					    	  fs.unlink(path);
					    	  res.send(null);
					      } else {
					    	  insertQuizLogo(req,res,dbQuizObj);
					      }
					});
				} else {
					insertQuizLogo(req,res,dbQuizObj);
				}
			} else {
				fs.unlink(path);
				res.send({error:"You do not have access to upload image for this Quiz"});
			}
		}).error(function(err) {
			fs.unlink(path);
			res.send({error:"Quiz data cannot be found.Please update Quiz details and then upload image"});
		});
	}
};

function insertQuizLogo(req,res,dbQuizObj) {
	var path = req.files.image.path;
	var mimeType = req.files.image.type;
	var fileName = "quiz"+dbQuizObj.quizCode+".png";
	if(mimeType =="image/jpeg") {
		fileName = "quiz"+dbQuizObj.quizCode+".jpeg";
	} else if(mimeType=="image/gif") {
		fileName = "quiz"+dbQuizObj.quizCode+".gif";
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
			
			aws.getAWSBucket().putObject(params, function(err, data) {
				fs.unlink(path);
			      if (err) {
			    	  res.send({error:"Cannot upload image. Please try again."});
			      } else {
			    	  dbQuizObj.quizImg = fileName; 
			    	  dbQuizObj.save(['quizImg']);
			    	  res.send({success:"Image uploaded successfully.",quizImg:fileName});
			      }
			});
		}
	});
}

Quizzes.getMyQuizzes = function(req,res) {
	if(req.isAuthenticated()) {
		db.model("Quiz").findAll({where: {createdBy:req.user.loggedInUserId,isActive:true} }).success(function(quizList) {
			res.send(quizList);
		}).error(function(err) {
			console.log('getMyQuizzes'+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Quizzes.getQuizPreview = function(req,res) { 
	var quizCode = req.body.quizCode;
	if(quizCode && quizCode.length>=8) {
		db.model("Quiz").find({ where: {quizCode:quizCode,isActive:true,isPublished:true} }).success(function(dbQuizObj) {
			res.send(dbQuizObj);
		}).error(function(err) {
			console.log('Quizzes.getQuizPreview getQuizPreview = getQuizPreview = '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

//---------------Question-------------------------------
Quizzes.crudQuizQuestionDetails = function(req,res) {
	if(req.isAuthenticated()) {
		var reqQuizCode =  req.body.quizCode;
		var reqQuestionObj = req.body.questionObj;
		
		db.model("Quiz").find({ where: {quizCode: reqQuizCode,isActive:true} }).success(function(dbQuizObj) {
			if(res.locals.isAdmin || dbQuizObj.createdBy == req.user.loggedInUserId) {
				if(req.body.action=='create') {
					reqQuestionObj.createdBy = reqQuestionObj.updatedBy = req.user.loggedInUserId;
					db.model("QuizQuestion").create(reqQuestionObj,[ 'questionNumber','questionType','question','questionIsRich','answer','answerDescr','answerDescrIsRich','createdBy','updatedBy','difficultyLevel']).success(function(insertedQuestionObj) {
						dbQuizObj.addQuestion(insertedQuestionObj).success(function() {
								for(var k=0;k<reqQuestionObj.questionOptions.length;k++) {
									reqQuestionObj.questionOptions[k].questionId = insertedQuestionObj.questionId;
								}
								db.model("QuizQuestionOption").bulkCreate(reqQuestionObj.questionOptions, ['optionDesc','isOptionRich','questionId','isAnswer']).success(function() {
									dbQuizObj.getQuestions({include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],order: 'questionNumber ASC'}).success(function(questionList) {
										insertedQuestionObj.getQuestionOptions().success(function(opts) {
											dbQuizObj.dataValues.questionList =questionList;
											dbQuizObj.dataValues.questionObj = insertedQuestionObj.dataValues;
											dbQuizObj.dataValues.questionObj.questionOptions = opts;
											dbQuizObj.dataValues.questionObj.success ='Question details saved successfully';
											dbQuizObj.numberOfQuestions = dbQuizObj.numberOfQuestions+1;
											dbQuizObj.save(['numberOfQuestions']);
											res.send(dbQuizObj.dataValues);
										});
									});
                                });
							}).error(function(err) {
								console.log('Quizzes.crudQuizQuestionDetails cannot add question to quiz = '+err);
								reqQuestionObj.error = "Cannot save question details.Please try again";
								dbQuizObj.questionObj = reqQuestionObj;
								res.send(dbQuizObj);
							});
						}).error(function(err) {
							console.log('Quizzes.crudQuizQuestionDetails action = create = '+err);
							dbQuizObj.error = "Cannot save Quiz details.Please try again";
							res.send(dbQuizObj);
						});
				} else if(req.body.action=='update') {
					db.model("QuizQuestion").find({where:{questionId:reqQuestionObj.questionId}}).success(function(dbQuestionObj) {
						dbQuestionObj.questionType = reqQuestionObj.questionType;
						dbQuestionObj.question = reqQuestionObj.question;
						dbQuestionObj.questionIsRich = reqQuestionObj.questionIsRich;
						dbQuestionObj.answer = reqQuestionObj.answer;
						dbQuestionObj.answerDescr = reqQuestionObj.answerDescr;
						dbQuestionObj.answerDescrIsRich = reqQuestionObj.answerDescrIsRich;
						dbQuestionObj.updatedBy = req.user.loggedInUserId;
						dbQuestionObj.difficultyLevel = reqQuestionObj.difficultyLevel;
						dbQuestionObj.save().success(function() {
							db.model("QuizQuestionOption").findAll({where:{questionId:dbQuestionObj.questionId}}).success(function(dbQuestionOptionList) {
								var chainer = new Sequelize.Utils.QueryChainer;
								for(var k=0;k<dbQuestionOptionList.length;k++) {
									dbQuestionOptionList[k].dataValues.isDeleted = true;
								}
								
								for(var k=0;k<reqQuestionObj.questionOptions.length;k++) {
									if(!reqQuestionObj.questionOptions[k].optionId || reqQuestionObj.questionOptions[k].optionId<=0) {
										reqQuestionObj.questionOptions[k].questionId = dbQuestionObj.questionId;
										chainer.add(db.model("QuizQuestionOption").create(reqQuestionObj.questionOptions[k], ['optionDesc','isOptionRich','questionId','isAnswer']));
									} else {
										for(var m=0;m<dbQuestionOptionList.length;m++) {
											if(reqQuestionObj.questionOptions[k].optionId == dbQuestionOptionList[m].optionId) {
												dbQuestionOptionList[m].dataValues.isDeleted =false;
												dbQuestionOptionList[m].isAnswer = reqQuestionObj.questionOptions[k].isAnswer;
												dbQuestionOptionList[m].isOptionRich = reqQuestionObj.questionOptions[k].isOptionRich;
												dbQuestionOptionList[m].optionDesc = reqQuestionObj.questionOptions[k].optionDesc;
												dbQuestionOptionList[m].questionId = dbQuestionObj.questionId;
												chainer.add(dbQuestionOptionList[m].save(['optionDesc','isOptionRich','questionId','isAnswer']));
											}
										}
									}
								}
								for(var k=0;k<dbQuestionOptionList.length;k++) {
									if(dbQuestionOptionList[k].dataValues.isDeleted) {
										chainer.add(dbQuestionOptionList[k].destroy());
									}
								}
								
								chainer.runSerially().success(function(results) {
									dbQuizObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}]}).success(function(questionList) {
										dbQuestionObj.getQuestionOptions().success(function(opts) {
											dbQuizObj.dataValues.questionList =questionList;
											dbQuizObj.dataValues.questionObj = dbQuestionObj.dataValues;
											dbQuizObj.dataValues.questionObj.questionOptions = opts;
											dbQuizObj.dataValues.questionObj.success ='Question details updated successfully';
											res.send(dbQuizObj.dataValues);
										});
									});
								}).error(function(errors) {
									console.log(errors);
									res.send(null);
								});
							});
						});
					});
				} else if(req.body.action=='delete') {
					dbQuizObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}],where:{questionNumber:req.body.questionNumber}}).success(function(questionList) {
						if(questionList.length>0) {
							var toDeleteObj = questionList[0];
							for(var k=0;k<toDeleteObj.questionOptions.length;k++) {
								toDeleteObj.questionOptions[k].destroy();
							}
							
							toDeleteObj.destroy().success(function() {
								dbQuizObj.getQuestions({order: 'questionNumber ASC',include:[{model: db.model("QuizQuestionOption"),as:'questionOptions'}]}).success(function(questionList) {
									var chainer = new Sequelize.Utils.QueryChainer;
									for(var kk=0;kk<questionList.length;kk++) {
										questionList[kk].questionNumber = kk+1;
										chainer.add(questionList[kk].save(['questionNumber']));
									}
									
									chainer.runSerially().success(function(results) {
										dbQuizObj.dataValues.questionList = questionList;
										dbQuizObj.dataValues.questionObj =null;
										dbQuizObj.numberOfQuestions = dbQuizObj.numberOfQuestions-1;
										if(dbQuizObj.numberOfQuestions < 0) {
											dbQuizObj.numberOfQuestions =0;
										}
										dbQuizObj.save(['numberOfQuestions']);
										res.send(dbQuizObj.dataValues);
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
				res.send(null);
			}
		}).error(function(err) {
			console.log('Quizzes.crudQuestionDetails = '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Quizzes.searchQuizQuery = function(req,res) {
	res.render('quizzes/quizHome');	
};

