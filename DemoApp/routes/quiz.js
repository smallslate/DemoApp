db = require("../models/Database");
module.exports = Quiz;

function Quiz() {
	 
}

Quiz.category = function(req,res) {
	res.render('user/admin/category');	
};

Quiz.crudCategory = function(req,res) {
	if(res.locals.isAdmin) {
		var requestObj = req.body;
		if(requestObj.action =='create') {
			var categoryObj = requestObj.categoryObj;
			categoryObj.createdBy = categoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").create(categoryObj).success(function(newCategoryObj) {
				newCategoryObj.dataValues.success = "Category saved successfully";
				console.log(newCategoryObj.dataValues);
				res.send(newCategoryObj.dataValues);
			}).error(function(err) {
				console.log('Quiz.crudCategory action = create = '+err);
				categoryObj.error = "Cannot save category data.Please Try Again";
				res.send(categoryObj);
			});
		} else if(requestObj.action =='update') {
			var categoryObj = requestObj.categoryObj;
			categoryObj.updatedBy = req.user.loggedInUserId;
			db.model("Category").update({categoryName:categoryObj.categoryName,categoryDescr:categoryObj.categoryDescr,categoryImg:categoryObj.categoryImg},{categoryId:categoryObj.categoryId})
			.success(function() {
				categoryObj.success = "Category updated successfully";
				res.send(categoryObj);
			}).error(function(err) {
				console.log('Quiz.crudCategory action = update = '+err);
				categoryObj.error = "Cannot update category data.Please Try Again";
				res.send(categoryObj);
			});
		} 
	}
};