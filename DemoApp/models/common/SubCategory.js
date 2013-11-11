module.exports = function(sequelize, DataTypes) {
  return sequelize.define("SubCategory", {
	subCategoryId: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true},
	subCategoryName: DataTypes.TEXT,
	subCategoryDescr: DataTypes.TEXT,
	subCategoryImg: DataTypes.STRING(2000),
	subCategoryCode :DataTypes.STRING(10),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	numberOfQuizzes: {type:DataTypes.BIGINT,defaultValue: 0},
	numberOfExams: {type:DataTypes.BIGINT,defaultValue: 0}
  });
};