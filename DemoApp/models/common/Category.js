module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Category", {
	categoryId : { type : DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	categoryName : DataTypes.TEXT,
	categoryDescr: DataTypes.TEXT,
	categoryImg: DataTypes.STRING(2000),
	categoryCode :DataTypes.STRING(10),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
    isActive : {type:DataTypes.BOOLEAN,defaultValue: true}
  });
};