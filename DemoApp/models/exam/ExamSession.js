module.exports = function(sequelize, DataTypes) {
  return sequelize.define("ExamSession", {
	examSessionId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	sessionCode: DataTypes.STRING(100),
	userId : DataTypes.BIGINT,
	examStatus : DataTypes.STRING(200),
	answers:DataTypes.TEXT,
	evalAnswers:DataTypes.TEXT,
	isEvaluated : {type:DataTypes.BOOLEAN,defaultValue: false},
	hasUserDeleted : {type:DataTypes.BOOLEAN,defaultValue: false},
	hasAuthorDeleted : {type:DataTypes.BOOLEAN,defaultValue: false}
  });
};
