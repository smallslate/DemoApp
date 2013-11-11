module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Exam", {
	examId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	examCode : DataTypes.STRING(100),
	examName : DataTypes.STRING(2000),
	examDescr: DataTypes.TEXT,
	examImg: DataTypes.STRING(2000),
	categoryCode : DataTypes.STRING(100),
	subCategoryCode : DataTypes.STRING(100),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	numberOfQuestions: {type:DataTypes.INTEGER,defaultValue: 0},
	noOfViews: {type:DataTypes.BIGINT,defaultValue: 0},
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	isPublished : {type:DataTypes.BOOLEAN,defaultValue: false},
	examTimeInMin: {type:DataTypes.BIGINT,defaultValue: 0}
  });
};