module.exports = function(sequelize, DataTypes) {
  return sequelize.define("FlashCard", {
	flashCardId : {type:DataTypes.BIGINT,autoIncrement : true,primaryKey : true},
	flashCardNumber : {type:DataTypes.INTEGER,defaultValue: 0},
	cardFront : DataTypes.TEXT,
	cardFrontIsRich : {type:DataTypes.BOOLEAN,defaultValue: false},
	cardBack: DataTypes.TEXT,
	cardBackIsRich : {type:DataTypes.BOOLEAN,defaultValue: false},
	createdBy : DataTypes.BIGINT,
	updatedBy: DataTypes.BIGINT,
	difficultyLevel : {type:DataTypes.INTEGER,defaultValue: 0}
  });
};
