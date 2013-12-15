module.exports = function(sequelize, DataTypes) {
  return sequelize.define("QuizQuestion", {
	questionId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	questionNumber : {type:DataTypes.INTEGER,defaultValue: 0},
	questionType : {type:DataTypes.STRING(10),defaultValue: 'MC'},
	question : DataTypes.TEXT,
	questionIsRich : {type:DataTypes.BOOLEAN,defaultValue: false},
	answerDescr: DataTypes.TEXT,
	answerDescrIsRich : {type:DataTypes.BOOLEAN,defaultValue: false},
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	difficultyLevel : {type:DataTypes.INTEGER,defaultValue: 0}
  });
};

//ALTER TABLE QuizQuestion MODIFY COLUMN question LONGTEXT
//ALTER TABLE QuizQuestion MODIFY COLUMN answerDescr LONGTEXT