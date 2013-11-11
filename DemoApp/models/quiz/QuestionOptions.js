module.exports = function(sequelize, DataTypes) {
  return sequelize.define("QuestionOptions", {
	optionId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	option : {type:DataTypes.INTEGER,defaultValue: 0},
	isOptionRich : {type:DataTypes.BOOLEAN,defaultValue: false}
  });
};