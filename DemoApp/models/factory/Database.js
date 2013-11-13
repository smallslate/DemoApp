var userModels = [{name:'User',path:'../common/User'},
                  {name:'Category',path:'../common/Category'},
                  {name:'SubCategory',path:'../common/SubCategory'},
                  {name:'Exam',path:'../quiz/Exam'},
                  {name:'Question',path:'../quiz/Question'},
                  {name:'QuestionOption',path:'../quiz/QuestionOption'}
                 ];
var models = {};

var Database = function Database() {
    var Sequelize = require("sequelize");
    var sequelize = null;
    
    this.setup = function (host, username, password){
    	sequelize = new Sequelize("smallslate", username, password,{
    		  host: host,
    		  port: 3306,
    		  dialect: 'mysql',
    		  pool: { maxConnections: 10, maxIdleTime: 30},
    		  omitNull: true
    	});       
        init();
    };
    
    this.model = function (name){
        return models[name];
    };
    
    this.Seq = function (){
        return Sequelize;
    };

    function init() {
    	userModels.forEach(function(modelObj) {
    		models[modelObj.name] = sequelize.import(__dirname + '/' +modelObj.path);
    	});
    	initRelations();
    	sequelize.sync().success(function() {
    		 console.log('All tables are created');
    	}).error(function(error) {
    		console.log('errors while creating '+error);
    	});
    }

    function initRelations() {
    	models["Category"].hasMany(models["SubCategory"],{as: 'subCategories',foreignKey: 'categoryId'});
    	models["Exam"].hasMany(models["Question"],{as: 'questions',foreignKey: 'examId'});
    	models["Question"].hasMany(models["QuestionOption"],{as: 'questionOptions',foreignKey: 'questionId'});
    }
    
    if(Database.caller != Database.getInstance){
        throw new Error("This object cannot be instanciated");
    }
};

Database.instance = null;

Database.getInstance = function(){
    if(this.instance === null){
        this.instance = new Database();
    }
    return this.instance;
};

module.exports = Database.getInstance();