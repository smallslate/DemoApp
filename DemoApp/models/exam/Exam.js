module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Exam", {
	examId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	examCode : DataTypes.STRING(100),
	examName : DataTypes.STRING(2000),
	examDescr: DataTypes.TEXT,
	examImg: {type:DataTypes.STRING(2000),defaultValue:'logo.png'},
	categoryCode : DataTypes.STRING(100),
	subCategoryCode : DataTypes.STRING(100),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	numberOfQuestions: {type:DataTypes.INTEGER,defaultValue: 0},
	noOfViews: {type:DataTypes.BIGINT,defaultValue: 0},
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	showResultsAfterExam : {type:DataTypes.BOOLEAN,defaultValue: true},
	isPublished : {type:DataTypes.BOOLEAN,defaultValue: false},
	examTime: {type:DataTypes.BIGINT,defaultValue: 0},
	examReferences : DataTypes.TEXT,
	authorDetails : DataTypes.TEXT
  });
};

//ALTER TABLE Exams MODIFY COLUMN authorDetails LONGTEXT
//ALTER TABLE Exams MODIFY COLUMN examReferences LONGTEXT
//ALTER TABLE questions MODIFY COLUMN question LONGTEXT
//ALTER TABLE questions MODIFY COLUMN answerDescr LONGTEXT
//ALTER TABLE questionOptions MODIFY COLUMN optionDesc LONGTEXT
//ALTER TABLE ExamSessions MODIFY COLUMN answers LONGTEXT
//ALTER TABLE ExamSessions MODIFY COLUMN evalAnswers LONGTEXT






