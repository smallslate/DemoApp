var db = require("../models/factory/Database"),
	hashids = require("../models/factory/Hashids");
module.exports = Quiz;

function Quiz() {}
//---------------Category-------------------------------
Quiz.category = function(req,res) {
	res.render('user/admin/category');	
};

Quiz.crudCategory = function(req,res) {
	if(res.locals.isAdmin) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var categoryObj = requestObj.categoryObj;
			categoryObj.createdBy = categoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").create(categoryObj,[ 'categoryName','categoryDescr','categoryImg','createdBy','updatedBy']).success(function(newCategoryObj) {
				newCategoryObj.dataValues.success = "Category saved successfully";
				res.send(newCategoryObj.dataValues);
			}).error(function(err) {
				console.log('Quiz.crudCategory action = create = '+err);
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
				console.log('Quiz.crudCategory action = update = '+err);
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
					console.log('Quiz.crudCategory action = update = '+err);
					categoryObj.error = "Cannot delete category.Please Try Again";
					res.send(categoryObj);
				});
			});
		} 
	}
};

Quiz.getAllCategories = function(req,res) {
	db.model("Category").findAll({where:{isActive: true}}).success(function(categoryList) {
		res.send(categoryList);
	}).error(function(err) {
		res.send(null);
	});
};

Quiz.getCategoryById = function(req,res) {
	db.model("Category").find({where:{categoryId:req.query.categoryId,isActive: true}}).success(function(categoryObj) {
		res.send(categoryObj);
	}).error(function(err) {
		res.send(null);
	});
};

//---------------Sub Categories-------------------------------

Quiz.subCategory = function(req,res) {
	res.render('user/admin/subCategory');	
};

Quiz.editCatSubCat = function(req,res) {
	res.render('user/admin/editCatSubCat');	
};

Quiz.getSubCategoryById = function(req,res) {
	db.model("SubCategory").find({where:{subCategoryId:req.query.subCategoryId,isActive: true}}).success(function(subCategoryObj) {
		res.send(subCategoryObj);
	}).error(function(err) {
		res.send(null);
	});
};

Quiz.getSubCategoriesByCategoryCode = function(req,res) {
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

Quiz.getAllCatAndSubCat = function(req,res) {
	db.model("Category").findAll({where:{isActive: true}}).success(function(categoryList) {
		var Sequelize = require('sequelize');
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

Quiz.crudSubCategory = function(req,res) {
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
						console.log('Quiz.crudSubCategory action = create = '+err);
						newSubCategoryObj.error ="Cannot save sub category. Please try again";
						res.send(newSubCategoryObj);
					});
				}).error(function(err) {
					console.log('Quiz.crudSubCategory action = create = '+err);
					subCategoryObj.error = "Cannot save sub category data.Please Try Again";
					res.send(subCategoryObj);
				});
			}).error(function(err) {
				console.log('Quiz.crudSubCategory Category you have selected cannot be found/disabled action = create = '+err);
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
				console.log('Quiz.crudCategory action = update = '+err);
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
				console.log('Quiz.crudCategory action = update = '+err);
				subCategoryObj.error = "Cannot delete category.Please Try Again";
				res.send(subCategoryObj);
			});
		}
	}
};

//---------------Exams-------------------------------
Quiz.createExam = function(req,res) {
	res.render('user/exam/createExam');	
};

Quiz.viewExams = function(req,res) {
	res.render('user/profile/viewExams');	
};

Quiz.getMyExams = function(req,res) {
	if(req.isAuthenticated()) {
		db.model("Exam").findAll({ where: {createdBy:req.user.loggedInUserId} }).success(function(examList) {
			res.send(examList);
		}).error(function(err) {
			console.log('Quiz.getMyExams '+err);
			res.send(null);
		});
	} else {
		res.send(null);
	}
};

Quiz.crudExamDetails = function(req,res) {
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
				console.log('Quiz.crudExam action = create = '+err);
				newExamObj.error = "Cannot save quiz details.Please try again";
				res.send(newExamObj);
			});
		} else if(requestObj.action =='update' || requestObj.action =='addQuestions') {
			var examObj = requestObj.examObj;
			db.model("Exam").find({ where: {examCode: examObj.examCode} }).success(function(dbExamObj) {
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
				console.log('Quiz.crudExam action = update = '+err);
				examObj.error = "Cannot update quiz details.Please try again";
				res.send(examObj);
			});
		} else if(requestObj.action =='getExamAndQueDetails') {
			db.model("Exam").find({ where: {examCode: req.body.examCode} }).success(function(examObj) {
				if(res.locals.isAdmin || examObj.createdBy == req.user.loggedInUserId) {
					res.send(examObj);
				} else {
					res.send(null);
				}
			}).error(function(err) {
				res.send(null);
			});
		}
	} else {
		res.send(null);
	}
};



