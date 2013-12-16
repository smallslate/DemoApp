db = require("../models/factory/Database");
module.exports = Common;

function Common() {
	 
}

Common.commonFilter = function(req,res,next) {
	Common.prototype.setAuthDetails(req,res);
	return next();
};

Common.index = function(req,res) {
	res.render('quizzes/quizHome');	
};

Common.login = function(req,res) {
	res.render('common/login');	
};

Common.authenticateUser = function(req, res,next) {
	if(req.isAuthenticated()) {
		return next();
	} else {
		req.session.redirectUrl = req.url;
		res.render('common/login');
	}
},

Common.authenticateAdmin = function(req, res,next) {
	if(req.isAuthenticated() && Common.prototype.isAdmin(req.user)) {
		return next();
	} else {
		Common.logout(req, res);
	}
},

Common.findOrCreateUser = function(providerId,firstName,lastName,displayName,callback) {
	db.model("User").find({ where:["providerId=?",providerId]}).success(function(existingUserObj) {
		if(existingUserObj && existingUserObj.userId > 0) {
			callback(existingUserObj);
		} else {
			db.model("User").create({ providerId: providerId, userFirstName: firstName, userLastName: lastName,userDisplayName:displayName}).success(function(newUserObj) {
				callback(newUserObj);
			});
		}
	});
},

Common.profile = function(req, res) {
	res.render('user/profile/profile');
},

Common.logout = function(req, res) {
	req.logout();
	Common.prototype.setAuthDetails(req,res);
	res.render('common/logout');
},

Common.afterLogin = function(req,res) {
	var redirectUrl = '/';
	if (req.session.redirectUrl) {
		redirectUrl = req.session.redirectUrl;
		req.session.redirectUrl = null;
	}
	res.redirect(redirectUrl);
};

Common.prototype.setAuthDetails = function(req,res) {
	res.locals.isAuthenticated = req.isAuthenticated();
	if(req.user) {
		if(req.user.displayName) {
			res.locals.displayName = req.user.displayName;
		}
		res.locals.isAdmin =this.isAdmin(req.user);
	} else {
		res.locals.isAdmin =false;
		res.locals.displayName ='';
	}
};

Common.prototype.isAdmin = function(user) {
	if(user) {
		if(user.emails && user.emails[0].value == "sathyavikram@gmail.com") {
			return true;
		}
	}
	return false;
};

function bindSearchResultsToSubCategory(resultList,req,res) {
	var subCatList = new Array();
	for(var k=0;k<resultList.length;k++) {
		subCatList.push(resultList[k].subCategoryCode);
	}
	db.model("SubCategory").findAll({where:{subCategoryCode:subCatList,isActive: true}}).success(function(subCategoryList) {
		var responseList = new Array();
		for(var k=0;k<subCategoryList.length;k++) {
			var subCatObj = new Object();
			subCatObj.subCategory =  subCategoryList[k];
			subCatObj.objectList=new Array();
			responseList.push(subCatObj);
		}
		for(var k=0;k<resultList.length;k++) {
			for(var m=0;m<responseList.length;m++) {
				if(resultList[k].subCategoryCode == responseList[m].subCategory.subCategoryCode) {
					responseList[m].objectList.push(resultList[k]);
					break;
				}
			}
		}
		res.send(responseList);
	}).error(function(err) {
		res.send(null);
	});
};

Common.search = function(req,res) {
	if(req.body.type && req.body.type=='quiz') {
		if(req.body.cc && req.body.cc.length>=8) {
			db.model("Quiz").findAll({where:{categoryCode:req.body.cc,isActive: true,isPublished:true}}).success(function(quizList) {
				if(quizList && quizList.length>0) {
					bindSearchResultsToSubCategory(quizList,req,res);
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		} else if(req.body.sc && req.body.sc.length>=8) {
			db.model("Quiz").findAll({where:{subCategoryCode:req.body.sc,isActive: true,isPublished:true}}).success(function(quizList) {
				if(quizList && quizList.length>0) {
					bindSearchResultsToSubCategory(quizList,req,res);
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		} else if(req.body.sq && req.body.sq.length>=0) {
			var responseList = new Array();
			var subCatObj = new Object();
			subCatObj.objectList = new Array();
			db.model("Quiz").findAll({where:["quizCode LIKE '"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(quizListWithCode) {
				if(quizListWithCode && quizListWithCode.length>0) {
					subCatObj.objectList = quizListWithCode;
				} 
				db.model("Quiz").findAll({where:["quizName LIKE '%"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(quizListWithName) {
					if(quizListWithName && quizListWithName.length>0) {
						for(var k=0;k<quizListWithName.length;k++) {
							var found = false;
							for(var m=0;m<subCatObj.objectList.length;m++) {
								if(subCatObj.objectList[m].quizId == quizListWithName[k].quizId) {
									found = true;
								}
							}
							if(!found) {
								subCatObj.objectList.push(quizListWithName[k]);
							}
						}
					}
					
					db.model("Quiz").findAll({where:["quizDescr LIKE '"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(quizListWithDescr) {
						if(quizListWithDescr && quizListWithDescr.length>0) {
							for(var k=0;k<quizListWithDescr.length;k++) {
								var found = false;
								for(var m=0;m<subCatObj.objectList.length;m++) {
									if(subCatObj.objectList[m].quizId == quizListWithDescr[k].quizId) {
										found = true;
									}
								}
								if(!found) {
									subCatObj.objectList.push(quizListWithDescr[k]);
								}
							}
						}
						if(subCatObj.objectList.length>0) {
							responseList.push(subCatObj);
							res.send(responseList);
						} else {
							res.send(null);
						}
					});
				});
			});
		}
	} else if(req.body.cc && req.body.cc.length>=8) {
		db.model("Exam").findAll({where:{categoryCode:req.body.cc,isActive: true,isPublished:true}}).success(function(examList) {
			if(examList && examList.length>0) {
				var subCatList = new Array();
				for(var k=0;k<examList.length;k++) {
					subCatList.push(examList[k].subCategoryCode);
				}
				db.model("SubCategory").findAll({where:{subCategoryCode:subCatList,isActive: true}}).success(function(subCategoryList) {
					var responseList = new Array();
					for(var k=0;k<subCategoryList.length;k++) {
						var subCatObj = new Object();
						subCatObj.subCategory =  subCategoryList[k];
						subCatObj.quizList=new Array();
						responseList.push(subCatObj);
					}
					
					for(var k=0;k<examList.length;k++) {
						for(var m=0;m<responseList.length;m++) {
							if(examList[k].subCategoryCode == responseList[m].subCategory.subCategoryCode) {
								responseList[m].quizList.push(examList[k]);
								break;
							}
						}
					}
					res.send(responseList);
				}).error(function(err) {
					res.send(null);
				});
			} else {
				res.send(null);
			}
		}).error(function(err) {
			res.send(null);
		});
	} else if(req.body.sc && req.body.sc.length>=8) {
		db.model("Exam").findAll({where:{subCategoryCode:req.body.sc,isActive: true,isPublished:true}}).success(function(examList) {
			if(examList && examList.length>0) {
				db.model("SubCategory").find({where:{subCategoryCode:req.body.sc,isActive: true}}).success(function(subCategoryObj) {
					var responseList = new Array();
					var subCatObj = new Object();
					subCatObj.subCategory =  subCategoryObj;
					subCatObj.quizList=examList;
					responseList.push(subCatObj);
					res.send(responseList);
				}).error(function(err) {
					res.send(null);
				});
			} else {
				res.send(null);
			}
		}).error(function(err) {
			res.send(null);
		});
	} else if(req.body.sq && req.body.sq.length>=0) {
		var responseList = new Array();
		var subCatObj = new Object();
		subCatObj.quizList = new Array();
		db.model("Exam").findAll({where:["examCode LIKE '"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(examListWithCode) {
			if(examListWithCode && examListWithCode.length>0) {
				subCatObj.quizList = examListWithCode;
			} 
			db.model("Exam").findAll({where:["examName LIKE '%"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(examListWithName) {
				if(examListWithName && examListWithName.length>0) {
					for(var k=0;k<examListWithName.length;k++) {
						var found = false;
						for(var m=0;m<subCatObj.quizList.length;m++) {
							if(subCatObj.quizList[m].examId == examListWithName[k].examId) {
								found = true;
							}
						}
						if(!found) {
							subCatObj.quizList.push(examListWithName[k]);
						}
					}
				}
				
				db.model("Exam").findAll({where:["examDescr LIKE '"+req.body.sq+"%' and isActive=true and isPublished = true"]}).success(function(examListWithDescr) {
					if(examListWithDescr && examListWithDescr.length>0) {
						for(var k=0;k<examListWithDescr.length;k++) {
							var found = false;
							for(var m=0;m<subCatObj.quizList.length;m++) {
								if(subCatObj.quizList[m].examId == examListWithDescr[k].examId) {
									found = true;
								}
							}
							if(!found) {
								subCatObj.quizList.push(examListWithDescr[k]);
							}
						}
					}
					if(subCatObj.quizList.length>0) {
						responseList.push(subCatObj);
						res.send(responseList);
					} else {
						res.send(null);
					}
				});
			});
		});
	} else if(req.body.sq && req.body.sq.length>=0) {
		res.redirect("/searchExams?sq="+req.body.msq);
	} else {
		res.send(null);
	}
};








