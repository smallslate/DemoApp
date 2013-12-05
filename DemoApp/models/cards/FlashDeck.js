module.exports = function(sequelize, DataTypes) {
  return sequelize.define("FlashDeck", {
	flashDeckId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	flashDeckCode : DataTypes.STRING(100),
	flashDeckName : DataTypes.STRING(2000),
	flashDeckDescr: DataTypes.TEXT,
	flashDeckImg: {type:DataTypes.STRING(2000),defaultValue:'logo.png'},
	categoryCode : DataTypes.STRING(100),
	subCategoryCode : DataTypes.STRING(100),
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	noOfFlashCards: {type:DataTypes.INTEGER,defaultValue: 0},
	noOfViews: {type:DataTypes.BIGINT,defaultValue: 0},
	isActive : {type:DataTypes.BOOLEAN,defaultValue: true},
	isPublished : {type:DataTypes.BOOLEAN,defaultValue: false},
	isShowAuthorDetails :  {type:DataTypes.BOOLEAN,defaultValue: false}
  });
};







