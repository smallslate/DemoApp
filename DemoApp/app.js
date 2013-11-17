var express = require('express')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy
  , common = require('./routes/common')
  , exam = require('./routes/exam')
  , db = require("./models/factory/Database");

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('env', 'development');
  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());  
  app.use(express.session({ secret: 'innovation' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
	  app.set('serverURL', 'http://localhost:3000/');
	  db.setup('localhost', "root", "lionking");
});

app.configure('production', function() {
	    app.set('serverURL', 'http://quizzes.elasticbeanstalk.com/');
	    db.setup('aa1whtjkwjb5isz.cndorxuubkhh.us-east-1.rds.amazonaws.com', "root", "lionking");
});

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});

passport.use(new GoogleStrategy({
    returnURL: app.get('serverURL')+'auth/google/return',
    realm: app.get('serverURL')
  },
  function(identifier, profile, done) {
      if(profile) {
    	  common.findOrCreateUser(profile.emails[0].value,profile.name.givenName,profile.name.familyName,profile.displayName,function(userData) {
    		  profile.loggedInUserId = userData.userId;
    		  return done(null, profile);
    	  });
      }	else {
          return done(null, null);
      }
  }
));
app.locals.basedir = 'views';

app.all('*', common.commonFilter);
app.all('/user/*',common.authenticateUser);
app.all('/user/admin/*',common.authenticateAdmin);

//---------------Common-------------------------------
app.get('/', common.index);
app.get('/login', common.login);
app.get('/logout', common.logout);
app.get('/user/profile', common.profile);

//---------------Auth-------------------------------
app.get('/auth/google', passport.authenticate('google'));
app.get('/auth/google/return',passport.authenticate('google', { failureRedirect: '/login' }), common.afterLogin);

//---------------Category-------------------------------
app.get('/user/admin/category', exam.category);
app.post('/user/admin/crudCategory', exam.crudCategory);
app.get('/getAllCategories', exam.getAllCategories);
app.get('/getCategoryById', exam.getCategoryById);

//---------------Sub Category-------------------------------
app.get('/user/admin/subCategory', exam.subCategory);
app.post('/user/admin/crudSubCategory', exam.crudSubCategory);
app.get('/user/admin/editCatSubCat', exam.editCatSubCat);
app.get('/getAllCatAndSubCat', exam.getAllCatAndSubCat);
app.get('/getSubCategoryById', exam.getSubCategoryById);
app.get('/getSubCategoriesByCategoryCode', exam.getSubCategoriesByCategoryCode);
app.get('/getSubCategoriesByExamCode', exam.getSubCategoriesByExamCode);

//---------------Exam-------------------------------
app.get('/user/createExam', exam.createExam);
app.get('/user/viewExams', exam.viewExams);
app.post('/user/getMyExams', exam.getMyExams);
app.post('/user/crudExamDetails', exam.crudExamDetails);
app.post('/user/uploadExamLogo', exam.uploadExamLogo);
//app.get('/user/epreview', exam.epreview);
app.get('/user/exam', exam.exam);

//---------------Question-------------------------------
app.post('/user/crudQuestionDetails', exam.crudQuestionDetails);

http.createServer(app).listen(app.get('port'), function(){
	console.log("Express server listening on port " + app.get('port'));
});
