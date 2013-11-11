db = require("../models/factory/Database");
module.exports = Common;

function Common() {
	 
}

Common.commonFilter = function(req,res,next) {
	Common.prototype.setAuthDetails(req,res);
	return next();
};

Common.index = function(req,res) {
	res.render('index');	
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