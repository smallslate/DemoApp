module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Quiz", {
	quizId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	quizCode : DataTypes.STRING(100),
	quizName : DataTypes.STRING(2000),
	quizDescr: DataTypes.TEXT,
	quizImg: {type:DataTypes.STRING(2000),defaultValue:'logo.png'},
	categoryCode : DataTypes.STRING(100),
	subCategoryCode : DataTypes.STRING(100),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	numberOfQuestions: {type:DataTypes.INTEGER,defaultValue: 0},
	noOfViews: {type:DataTypes.BIGINT,defaultValue: 0},
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	isPublished : {type:DataTypes.BOOLEAN,defaultValue: false},
	references : DataTypes.TEXT,
	authorDetails : DataTypes.TEXT
  });
};

//ALTER TABLE Quizzes MODIFY COLUMN references LONGTEXT
//ALTER TABLE Quizzes MODIFY COLUMN authorDetails LONGTEXT




