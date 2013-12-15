module.exports = function(sequelize, DataTypes) {
  return sequelize.define("QuizQuestionOption", {
	optionId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	optionDesc : {type:DataTypes.TEXT,defaultValue: 0},
	isAnswer :{type:DataTypes.BOOLEAN,defaultValue: false},
	isOptionRich : {type:DataTypes.BOOLEAN,defaultValue: false}
  });
};
//ALTER TABLE QuizQuestionOption MODIFY COLUMN optionDesc LONGTEXT
