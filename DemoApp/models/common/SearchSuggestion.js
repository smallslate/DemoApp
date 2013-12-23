module.exports = function(sequelize, DataTypes) {
  return sequelize.define("SearchSuggestion", {
	 suggestionTest : DataTypes.STRING(2000),
	 type :{type:DataTypes.STRING(1),defaultValue: 'q'}
  });
};